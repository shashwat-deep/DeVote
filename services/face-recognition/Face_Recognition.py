import os
import cv2
import tensorflow as tf
import numpy as np
from deepface import DeepFace
from mtcnn import MTCNN
from contextlib import contextmanager

# Base directory for the project
BASE_DIR = r"C:\Github Repos"
DATABASE_DIR = os.path.join(BASE_DIR, "face_database")
TEMP_DIR = os.path.join(BASE_DIR, "temp")

# Ensure directories exist
os.makedirs(DATABASE_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# Initialize the MTCNN detector for face alignment
detector = MTCNN()

@contextmanager
def open_camera(index=0):
    """
    Context manager to handle camera resource cleanup.
    """
    cap = cv2.VideoCapture(index)
    try:
        yield cap
    finally:
        cap.release()
        cv2.destroyAllWindows()

def align_face(image):
    """
    Align the face in the given image using MTCNN landmarks.
    """
    try:
        # Convert BGR (OpenCV) to RGB for MTCNN
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        detections = detector.detect_faces(rgb_image)

        if len(detections) == 0:
            print("No face detected for alignment.")
            return None

        # Use the first detected face
        face = detections[0]
        keypoints = face.get("keypoints")
        if not keypoints:
            print("No facial keypoints detected.")
            return None

        left_eye = keypoints["left_eye"]
        right_eye = keypoints["right_eye"]

        # Calculate the angle between the eyes
        dx = right_eye[0] - left_eye[0]
        dy = right_eye[1] - left_eye[1]
        angle = np.degrees(np.arctan2(dy, dx))

        # Compute the center of the eyes as floats
        eye_center = (float(left_eye[0] + right_eye[0]) / 2, float(left_eye[1] + right_eye[1]) / 2)

        # Get rotation matrix
        h, w = image.shape[:2]
        rotation_matrix = cv2.getRotationMatrix2D(eye_center, angle, 1)

        # Align the image
        aligned_face = cv2.warpAffine(image, rotation_matrix, (w, h), flags=cv2.INTER_CUBIC)

        # Crop the aligned face (use face bounding box)
        x, y, width, height = face["box"]
        x, y = max(0, x), max(0, y)  # Ensure coordinates are not negative
        cropped_face = aligned_face[y:y+height, x:x+width]

        return cropped_face
    except Exception as e:
        print(f"Error during face alignment: {e}")
        return None

def capture_image(prompt):
    """
    Capture a single image from the webcam with live feedback for alignment.
    """
    print(f"{prompt} Press 's' to capture or 'q' to quit.")
    with open_camera() as cap:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to access the camera. Exiting.")
                break

            # Attempt face alignment for live feedback
            aligned_face = align_face(frame)
            if aligned_face is not None:
                # Display aligned face alongside the raw feed
                aligned_preview = cv2.resize(aligned_face, (200, 200))  # Resize for side-by-side view
                combined_view = np.hstack((cv2.resize(frame, (200, 200)), aligned_preview))
            else:
                # If alignment fails, show only the raw feed
                combined_view = cv2.resize(frame, (400, 200))

            cv2.imshow("Live Feed (Left: Raw, Right: Aligned)", combined_view)

            # Wait for user input
            key = cv2.waitKey(1) & 0xFF
            if key == ord('s'):  # 's' to save
                if aligned_face is not None:
                    print("Image captured and aligned!")
                    return aligned_face
                else:
                    print("No alignment achieved. Please try again.")
            elif key == ord('q'):  # 'q' to quit
                print("Exiting...")
                return None

def register_user(name):
    """
    Register a user by capturing aligned images of their face at different angles.
    """
    user_dir = os.path.join(DATABASE_DIR, name)
    os.makedirs(user_dir, exist_ok=True)

    print(f"Registering user '{name}'. Please follow the prompts to capture images.")

    angles = [
        {"name": "straight", "prompt": "Face the camera straight ahead."},
        {"name": "left", "prompt": "Turn your face slightly to the left."},
        {"name": "right", "prompt": "Turn your face slightly to the right."},
        {"name": "up", "prompt": "Tilt your head slightly upward."},
        {"name": "down", "prompt": "Tilt your head slightly downward."}
    ]

    for angle in angles:
        while True:
            frame = capture_image(angle["prompt"])
            if frame is None:
                print(f"Registration canceled for '{name}'.")
                return False

            # Save the aligned face
            image_path = os.path.join(user_dir, f"{angle['name']}.jpg")
            cv2.imwrite(image_path, frame)
            print(f"Aligned image for '{angle['name']}' saved at {image_path}.")
            break

    print(f"User {name} registered successfully with all angles!")
    return True

def verify_user():
    """
    Verify a user's identity by comparing their aligned face with stored images.
    """
    print("Capturing image for verification...")
    frame = capture_image("Face the camera straight ahead for verification.")
    if frame is None:
        print("Verification canceled.")
        return False

    # Save the aligned image temporarily
    temp_path = os.path.join(TEMP_DIR, "temp.jpg")
    cv2.imwrite(temp_path, frame)

    # Compare with stored images for each user
    for user in os.listdir(DATABASE_DIR):
        user_dir = os.path.join(DATABASE_DIR, user)
        if os.path.isdir(user_dir):  # Ensure it's a user folder
            match_found = False
            for angle_file in os.listdir(user_dir):
                if angle_file.endswith(".jpg"):
                    stored_path = os.path.join(user_dir, angle_file)
                    print(f"Comparing with {user}/{angle_file}...")

                    try:
                        result = DeepFace.verify(temp_path, stored_path, model_name="Facenet", enforce_detection=False)
                        if result["verified"]:
                            print(f"User verified successfully as {user}!")
                            match_found = True
                            break
                    except Exception as e:
                        print(f"Error during verification: {e}")

            if match_found:
                os.remove(temp_path)  # Clean up temp file
                return user

    print("Verification failed. No matching user found.")
    os.remove(temp_path)  # Clean up temp file
    return False

# Example Workflow
if __name__ == "__main__":
    print("1. Register a User")
    print("2. Verify a User")
    choice = input("Choose an option: ")

    if choice == "1":
        name = input("Enter your name: ")
        register_user(name)

    elif choice == "2":
        verify_user()
