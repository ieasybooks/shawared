"""The pronunciation, model and occurrence order shared by the alignment commands."""
import os
import re


MODEL = os.path.expanduser("~/.cache/shawared/mms-300m-forced-aligner.onnx")


def romanize(u, word):
    """A voweled taa marbuta is recited as t; at a pause it is h."""
    word = re.sub(r"ة(?=[\u064B-\u0650])", "ت", word)
    word = re.sub(r"ة(?=[\u0651\u0652]?$)", "ه", word)
    return re.sub(r"[^a-z']", "", u.romanize_string(word).lower())


def tokens_for(words):
    return [token for word in words for token in ("<star>", " ".join(word))]


def model_session():
    import ctc_forced_aligner as cfa
    import onnxruntime

    cfa.ensure_onnx_model(MODEL, cfa.MODEL_URL)
    return onnxruntime.InferenceSession(MODEL)


def timeline_for(plan, halves, words):
    timeline, i = [], 0
    for half in plan:
        n = len(halves[half])
        occurrence = words[i:i + n]
        i += n
        timeline.append([half, occurrence[0]["start"], occurrence[-1]["end"],
                         round(min(word["conf"] for word in occurrence), 3)])
    return timeline
