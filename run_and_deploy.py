"""
Omniradar Auto-Run & Deploy Script.

Runs the full pipeline (9-source collection + AI analysis),
copies results to frontend, builds, commits, and pushes to trigger Vercel deploy.

Usage:
  python run_and_deploy.py          # Run pipeline + deploy
  python run_and_deploy.py --dry    # Run pipeline only, no git push
"""

import subprocess
import shutil
import sys
import os
import json
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("auto_run.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
PIPELINE_OUTPUT = os.path.join(PROJECT_ROOT, "daily_beauty_insights.json")
FRONTEND_DATA = os.path.join(PROJECT_ROOT, "frontend", "src", "lib", "pipeline_data.json")
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")

def run_pipeline():
    """Run main.py pipeline."""
    logger.info("=== STEP 1: Running pipeline ===")
    result = subprocess.run(
        [sys.executable, "main.py"],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True,
        timeout=600  # 10 min max
    )
    if result.returncode != 0:
        logger.error(f"Pipeline failed:\n{result.stderr}")
        return False

    # Check output file exists and has trends
    if not os.path.exists(PIPELINE_OUTPUT):
        logger.error("Pipeline did not produce output file")
        return False

    with open(PIPELINE_OUTPUT) as f:
        data = json.load(f)

    trend_count = len(data.get("trends", []))
    signal_count = sum(len(v) for v in data.get("raw_signals", {}).values() if isinstance(v, list))
    logger.info(f"Pipeline produced {trend_count} AI trends, {signal_count} raw signals")

    if trend_count == 0:
        logger.error("Pipeline produced 0 trends — AI analysis may have failed")
        return False

    return True

def copy_to_frontend():
    """Copy pipeline output to frontend data file."""
    logger.info("=== STEP 2: Copying data to frontend ===")
    shutil.copy2(PIPELINE_OUTPUT, FRONTEND_DATA)
    logger.info(f"Copied to {FRONTEND_DATA}")

def build_frontend():
    """Run npm build."""
    logger.info("=== STEP 3: Building frontend ===")
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=FRONTEND_DIR,
        capture_output=True,
        text=True,
        timeout=120,
        shell=True
    )
    if result.returncode != 0:
        logger.error(f"Frontend build failed:\n{result.stderr}")
        return False
    logger.info("Frontend build successful")
    return True

def git_commit_and_push():
    """Commit changes and push to trigger Vercel deploy."""
    logger.info("=== STEP 4: Git commit & push ===")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Stage files
    subprocess.run(
        ["git", "add", "daily_beauty_insights.json", "frontend/src/lib/pipeline_data.json"],
        cwd=PROJECT_ROOT,
        capture_output=True
    )

    # Check if there are changes to commit
    status = subprocess.run(
        ["git", "diff", "--cached", "--stat"],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True
    )
    if not status.stdout.strip():
        logger.info("No changes to commit (data unchanged)")
        return True

    # Commit
    msg = f"Auto-update: pipeline data refresh {timestamp}"
    result = subprocess.run(
        ["git", "commit", "-m", msg],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        logger.error(f"Git commit failed:\n{result.stderr}")
        return False

    # Push
    result = subprocess.run(
        ["git", "push", "origin", "main"],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True,
        timeout=60
    )
    if result.returncode != 0:
        logger.error(f"Git push failed:\n{result.stderr}")
        return False

    logger.info(f"Pushed to GitHub — Vercel deploy triggered")
    return True

def main():
    dry_run = "--dry" in sys.argv
    start = datetime.now()

    logger.info(f"{'='*60}")
    logger.info(f"Omniradar Auto-Run started at {start.isoformat()}")
    logger.info(f"Mode: {'DRY RUN (no deploy)' if dry_run else 'FULL (pipeline + deploy)'}")
    logger.info(f"{'='*60}")

    # Step 1: Run pipeline
    if not run_pipeline():
        logger.error("FAILED at pipeline step. Aborting.")
        sys.exit(1)

    # Step 2: Copy to frontend
    copy_to_frontend()

    # Step 3: Build frontend
    if not build_frontend():
        logger.error("FAILED at build step. Aborting.")
        sys.exit(1)

    # Step 4: Commit & push (unless dry run)
    if dry_run:
        logger.info("DRY RUN — skipping git commit & push")
    else:
        if not git_commit_and_push():
            logger.error("FAILED at deploy step.")
            sys.exit(1)

    elapsed = (datetime.now() - start).total_seconds()
    logger.info(f"{'='*60}")
    logger.info(f"Omniradar Auto-Run completed in {elapsed:.0f}s")
    logger.info(f"{'='*60}")

if __name__ == "__main__":
    main()
