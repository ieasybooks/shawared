import contextlib
import io
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

import alignment
import variants


class AlignmentTest(unittest.TestCase):
    def test_romanization_preserves_spoken_taa_marbuta_and_aligner_alphabet(self):
        for word, spoken in [("بُثَينَةُ", "بُثَينَتُ"), ("رَحمَة", "رَحمَه"), ("رَحمَةْ", "رَحمَهْ"), ("قَلب", "قَلب")]:
            with self.subTest(word=word):
                uroman = SimpleNamespace(romanize_string=Mock(return_value="  Ta-BA'12! "))
                self.assertEqual(alignment.romanize(uroman, word), "taba'")
                uroman.romanize_string.assert_called_once_with(spoken)

    def test_each_word_has_its_own_star_and_letter_separators(self):
        self.assertEqual(alignment.tokens_for(iter(["ab", "c'd"])), ["<star>", "a b", "<star>", "c ' d"])

    def test_repeated_and_skipped_halves_keep_their_own_occurrence_times(self):
        halves = {"1.1": ["a", "b"], "1.2": ["c"], "2.1": ["skipped"]}
        words = [
            {"address": "1.1.1", "start": 0.2, "end": 0.7, "conf": 0.91},
            {"address": "1.1.2", "start": 0.9, "end": 1.3, "conf": 0.85},
            {"address": "1.2.1", "start": 2, "end": 2.5, "conf": 0.42},
            {"address": "1.1.1", "start": 4, "end": 4.5, "conf": 0.77},
            {"address": "1.1.2", "start": 4.8, "end": 5.2, "conf": 0.62},
        ]
        self.assertEqual(alignment.timeline_for(["1.1", "1.2", "1.1"], halves, words), [
            ["1.1", 0.2, 1.3, 0.85], ["1.2", 2, 2.5, 0.42], ["1.1", 4, 5.2, 0.62],
        ])

    def test_variants_can_initialize_a_fresh_model_cache_before_scoring(self):
        with tempfile.TemporaryDirectory() as directory:
            model = Path(directory) / "model.onnx"
            session = object()
            downloaded = []

            def ensure_model(path, url):
                self.assertEqual(url, "fixture-model")
                if not Path(path).exists():
                    downloaded.append(path)
                    Path(path).write_bytes(b"fixture")

            def open_model(path):
                self.assertEqual(Path(path).read_bytes(), b"fixture")
                return session

            scores = iter([[-2.0], [-0.25, -0.5]])
            cfa = SimpleNamespace(
                MODEL_URL="fixture-model", ensure_onnx_model=ensure_model,
                load_audio=lambda _: list(range(32_000)), Tokenizer=object,
                generate_emissions=Mock(return_value=("emissions", 20)),
                get_alignments=lambda *_: ([], next(scores), 0),
            )
            modules = {
                "ctc_forced_aligner": cfa,
                "onnxruntime": SimpleNamespace(InferenceSession=open_model),
                "numpy": SimpleNamespace(asarray=lambda values: SimpleNamespace(sum=lambda: sum(values))),
                "uroman": SimpleNamespace(Uroman=lambda: SimpleNamespace(romanize_string=lambda word: word)),
            }
            output = io.StringIO()
            with patch.dict(sys.modules, modules), patch.object(alignment, "MODEL", str(model)), \
                    patch.object(sys, "argv", ["variants.py", "audio.wav", "0.5", "0.6", "first", "second"]), \
                    contextlib.redirect_stdout(output):
                variants.main()
                self.assertIs(alignment.model_session(), session)

            self.assertEqual(downloaded, [str(model)])
            cfa.generate_emissions.assert_called_once_with(session, list(range(3_200, 14_399)), batch_size=1)
            lines = output.getvalue().splitlines()
            self.assertRegex(lines[0], r"\(\s*\+0\.00\)\s+second\s+\[second\]")
            self.assertRegex(lines[1], r"\(\s*-1\.25\)\s+first\s+\[first\]")


if __name__ == "__main__":
    unittest.main()
