import contextlib
import hashlib
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import recording
import verify


class RecordingTest(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        environment = patch.dict(os.environ, {"SHAWARED_ROOT": str(self.root)})
        environment.start()
        self.addCleanup(environment.stop)
        self.recitation = self.root / "content/poems/poem/recitations/take.json"
        self.recitation.parent.mkdir(parents=True)
        self.audio = self.root / "media/audio/poem/take.m4a"
        self.audio.parent.mkdir(parents=True)
        self.audio.write_bytes(b"local recording")
        digest = hashlib.sha256(self.audio.read_bytes()).hexdigest()[:12]
        self.key = f"poem/take.{digest}.m4a"
        self.old = {"reciter": "performer", "audio": self.key, "duration": 2,
                    "source": "https://example.com/recording", "timeline": [["1.1", 0.2, 1.0]]}

    def write_timeline(self, source=None):
        def probe(command, **_):
            self.assertEqual(command[-1], str(self.audio))
            self.assertTrue(Path(command[-1]).exists())
            return SimpleNamespace(stdout="2.127\n")

        with patch.object(recording.subprocess, "run", side_effect=probe), contextlib.redirect_stdout(io.StringIO()):
            recording.write_recitation(self.recitation, "poem", source, [["1.1", 0.126, 1.876, 0.9]])
        return json.loads(self.recitation.read_text())

    def test_realigning_keeps_the_published_key_and_reciter_but_reads_the_local_source(self):
        self.recitation.write_text(json.dumps(self.old))
        self.assertEqual(self.write_timeline(), {
            "reciter": "performer", "audio": self.key, "duration": 2.13,
            "source": "https://example.com/recording", "timeline": [["1.1", 0.13, 1.88]],
        })

    def test_new_recitation_uses_its_filename_and_an_unpublished_key(self):
        self.assertEqual(self.write_timeline("https://example.com/new"), {
            "reciter": "take", "audio": "poem/take.m4a", "duration": 2.13,
            "source": "https://example.com/new", "timeline": [["1.1", 0.13, 1.88]],
        })

    def test_changed_source_does_not_silently_replace_the_published_key(self):
        self.recitation.write_text(json.dumps(self.old))
        self.audio.write_bytes(b"a different recording")
        self.assertEqual(self.write_timeline()["audio"], self.key)

    def test_verification_uses_the_local_source_or_an_explicit_audio_override(self):
        self.recitation.write_text(json.dumps(self.old))
        poem = {"abyat": [{"n": 1, "sadr": "قال", "ajuz": "قلب"}]}
        (self.recitation.parent.parent / "poem.json").write_text(json.dumps(poem))
        override = self.root / "app16k.wav"
        override.write_bytes(b"decoded recording")

        for extra, expected in [([], self.audio), (["--audio", str(override)], override)]:
            with self.subTest(extra=extra):
                inputs = []

                def run(command, **_):
                    if command[0] == "ffmpeg":
                        audio = Path(command[command.index("-i") + 1])
                        self.assertTrue(audio.exists())
                        inputs.append(audio)
                        Path(command[-1]).write_bytes(b"clip")
                    else:
                        output = Path(command[command.index("-o") + 1])
                        output.mkdir(parents=True)
                        (output / "000_1.1.json").write_text(json.dumps([{"text": "قال"}]))

                output = io.StringIO()
                with patch.object(verify, "ROOT", self.root), patch.object(verify.subprocess, "run", side_effect=run), \
                        patch.object(sys, "argv", ["verify.py", "poem", "take", *extra]), contextlib.redirect_stdout(output):
                    verify.main()
                self.assertEqual(inputs, [expected])
                self.assertIn("1 clips, 0 with differences", output.getvalue())

    def test_documented_isolated_verify_command_imports_helpers_outside_the_checkout(self):
        result = subprocess.run([sys.executable, "-I", str(Path(verify.__file__).resolve()), "--help"],
                                cwd=self.root, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("--reuse", result.stdout)


if __name__ == "__main__":
    unittest.main()
