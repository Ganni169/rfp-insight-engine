import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.append(str(BACKEND_ROOT))

# Placeholder for offline document ingestion script
if __name__ == "__main__":
    print("Run offline ingestion logic here")
