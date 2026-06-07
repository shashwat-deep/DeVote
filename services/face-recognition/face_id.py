"""DeVote face-recognition utility.

A standalone CLI for registering and verifying voter faces using MTCNN
(alignment) and DeepFace (verification). Storage locations are configurable
via the ``DEVOTE_FACE_DATA_DIR`` environment variable or the ``--data-dir``
flag (no hardcoded paths).

Usage:
    python face_id.py register --name alice
    python face_id.py verify
"""

from __future__ import annotations

import argparse
import os
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator, Optional

import cv2
import numpy as np
from deepface import DeepFace
from mtcnn import MTCNN

DEFAULT_DATA_DIR = Path(os.environ.get("DEVOTE_FACE_DATA_DIR", "./.face-data")).expanduser()

CAPTURE_ANGLES = [
    {"name": "straight", "prompt": "Face the camera straight ahead."},
    {"name": "left", "prompt": "Turn your face slightly to the left."},
    {"name": "right", "prompt": "Turn your face slightly to the right."},
    {"name": "up", "prompt": "Tilt your head slightly upward."},
    {"name": "down", "prompt": "Tilt your head slightly downward."},
]

_detector: Optional[MTCNN] = None


def get_detector() -> MTCNN:
    """Lazily construct the MTCNN detector (avoids import-time side effects)."""
    global _detector
    if _detector is None:
        _detector = MTCNN()
    return _detector


def data_dirs(base: Path) -> tuple[Path, Path]:
    """Return (database_dir, temp_dir), creating them if needed."""
    database_dir = base / "face_database"
    temp_dir = base / "temp"
    database_dir.mkdir(parents=True, exist_ok=True)
    temp_dir.mkdir(parents=True, exist_ok=True)
    return database_dir, temp_dir


@contextmanager
def open_camera(index: int = 0) -> Iterator["cv2.VideoCapture"]:
    """Context manager that releases the camera and windows on exit."""
    cap = cv2.VideoCapture(index)
    try:
        yield cap
    finally:
        cap.release()
        cv2.destroyAllWindows()


def align_face(image: np.ndarray) -> Optional[np.ndarray]:
    """Align and crop the first detected face using MTCNN eye landmarks."""
    try:
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        detections = get_detector().detect_faces(rgb_image)
        if not detections:
            return None

        face = detections[0]
        keypoints = face.get("keypoints")
        if not keypoints:
            return None

        left_eye = keypoints["left_eye"]
        right_eye = keypoints["right_eye"]
        dx = right_eye[0] - left_eye[0]
        dy = right_eye[1] - left_eye[1]
        angle = float(np.degrees(np.arctan2(dy, dx)))
        eye_center = (
            float(left_eye[0] + right_eye[0]) / 2,
            float(left_eye[1] + right_eye[1]) / 2,
        )

        height, width = image.shape[:2]
        rotation_matrix = cv2.getRotationMatrix2D(eye_center, angle, 1)
        aligned = cv2.warpAffine(image, rotation_matrix, (width, height), flags=cv2.INTER_CUBIC)

        x, y, box_w, box_h = face["box"]
        x, y = max(0, x), max(0, y)
        return aligned[y : y + box_h, x : x + box_w]
    except Exception as error:  # noqa: BLE001 - surface, don't crash the CLI loop
        print(f"Error during face alignment: {error}")
        return None


def capture_image(prompt: str) -> Optional[np.ndarray]:
    """Capture a single aligned face from the webcam with live preview."""
    print(f"{prompt} Press 's' to capture or 'q' to quit.")
    with open_camera() as cap:
        while True:
            ok, frame = cap.read()
            if not ok:
                print("Failed to access the camera. Exiting.")
                return None

            aligned = align_face(frame)
            if aligned is not None and aligned.size > 0:
                preview = np.hstack(
                    (cv2.resize(frame, (200, 200)), cv2.resize(aligned, (200, 200)))
                )
            else:
                preview = cv2.resize(frame, (400, 200))
            cv2.imshow("Live Feed (Left: Raw, Right: Aligned)", preview)

            key = cv2.waitKey(1) & 0xFF
            if key == ord("s"):
                if aligned is not None and aligned.size > 0:
                    print("Image captured and aligned!")
                    return aligned
                print("No alignment achieved. Please try again.")
            elif key == ord("q"):
                print("Exiting...")
                return None


def register_user(name: str, database_dir: Path) -> bool:
    """Capture aligned images of a user's face from several angles."""
    user_dir = database_dir / name
    user_dir.mkdir(parents=True, exist_ok=True)
    print(f"Registering user '{name}'. Follow the prompts to capture images.")

    for angle in CAPTURE_ANGLES:
        frame = capture_image(angle["prompt"])
        if frame is None:
            print(f"Registration canceled for '{name}'.")
            return False
        image_path = user_dir / f"{angle['name']}.jpg"
        cv2.imwrite(str(image_path), frame)
        print(f"Saved aligned image for '{angle['name']}' at {image_path}.")

    print(f"User '{name}' registered successfully with all angles!")
    return True


def verify_user(database_dir: Path, temp_dir: Path) -> Optional[str]:
    """Verify a captured face against the registered database."""
    print("Capturing image for verification...")
    frame = capture_image("Face the camera straight ahead for verification.")
    if frame is None:
        print("Verification canceled.")
        return None

    temp_path = temp_dir / "temp.jpg"
    cv2.imwrite(str(temp_path), frame)
    try:
        for user_dir in sorted(p for p in database_dir.iterdir() if p.is_dir()):
            for stored in sorted(user_dir.glob("*.jpg")):
                print(f"Comparing with {user_dir.name}/{stored.name}...")
                try:
                    result = DeepFace.verify(
                        str(temp_path),
                        str(stored),
                        model_name="Facenet",
                        enforce_detection=False,
                    )
                    if result["verified"]:
                        print(f"User verified successfully as {user_dir.name}!")
                        return user_dir.name
                except Exception as error:  # noqa: BLE001
                    print(f"Error during verification: {error}")
        print("Verification failed. No matching user found.")
        return None
    finally:
        temp_path.unlink(missing_ok=True)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="DeVote face-recognition CLI")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DEFAULT_DATA_DIR,
        help="Base directory for the face database (env: DEVOTE_FACE_DATA_DIR)",
    )
    sub = parser.add_subparsers(dest="command", required=True)
    register = sub.add_parser("register", help="Register a new user")
    register.add_argument("--name", required=True, help="User name / identifier")
    sub.add_parser("verify", help="Verify a user against the database")
    return parser


def main(argv: Optional[list[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    database_dir, temp_dir = data_dirs(args.data_dir)

    if args.command == "register":
        return 0 if register_user(args.name, database_dir) else 1
    if args.command == "verify":
        return 0 if verify_user(database_dir, temp_dir) else 1
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
