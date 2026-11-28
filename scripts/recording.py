"""Local recording sources and recitation metadata written by the speech tools."""
import json
import os
import subprocess
from pathlib import Path


def repository_root():
    return Path(os.environ.get("SHAWARED_ROOT", Path(__file__).resolve().parent.parent))


def source_key(poem, recitation):
    return f"{poem}/{recitation}.m4a"


def source_path(root, poem, recitation):
    return Path(root) / "media" / "audio" / source_key(poem, recitation)


def write_recitation(path, poem_id, source, timeline):
    """Only upload changes a published key; keeping it lets the checker detect changed source bytes."""
    path = Path(path)
    rec_id = path.stem
    audio = source_path(repository_root(), poem_id, rec_id)
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(audio)],
                         capture_output=True, text=True, check=True)
    old = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    rec = {"reciter": old.get("reciter", rec_id), "audio": old.get("audio", source_key(poem_id, rec_id)),
           "duration": round(float(out.stdout), 2)}
    if source or old.get("source"):
        rec["source"] = source or old["source"]
    lines = ",\n".join(f'    [{json.dumps(h)}, {s:.2f}, {e:.2f}]' for h, s, e, _ in timeline)
    head = ",\n".join(f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}" for k, v in rec.items())
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("{\n" + head + ',\n  "timeline": [\n' + lines + "\n  ]\n}\n", encoding="utf-8")
    print(f"wrote {path}")
