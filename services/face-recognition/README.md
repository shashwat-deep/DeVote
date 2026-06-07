# DeVote — Face Recognition Service

A standalone CLI for registering and verifying voter faces, intended as an
**optional** identity-assurance step _before_ a voter is registered on-chain.
It is deliberately decoupled from the web app (no network/auth coupling).

> ⚠️ Biometric data is sensitive. Store the data directory securely, obtain
> informed consent, and comply with applicable privacy law (e.g. GDPR/BIPA).
> This module is a reference implementation, not a turnkey production system.

## Setup

```bash
cd services/face-recognition
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## Usage

The data directory is configurable (no hardcoded paths). It defaults to
`./.face-data` and can be overridden by the `DEVOTE_FACE_DATA_DIR` environment
variable or the `--data-dir` flag.

```bash
# Register a user (captures several aligned angles from the webcam)
python face_id.py register --name alice

# Verify a face against the registered database
python face_id.py verify

# Custom storage location
DEVOTE_FACE_DATA_DIR=/secure/volume python face_id.py verify
```

Press `s` to capture and `q` to quit during webcam capture.
