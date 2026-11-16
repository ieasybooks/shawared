import { describe, expect, it } from "vitest";
import { houseStyle, tashkeelIssues } from "./tashkeel.ts";

describe("houseStyle", () => {
  it("drops sukun and the vowel before a long letter", () => {
    expect(houseStyle("قَالَ الَّذِي تَقُولُ عَلَى رَأَتْ")).toBe("قالَ الَّذي تَقولُ عَلى رَأَت");
    expect(houseStyle("لَمَّا كَانُوا")).toBe("لَمّا كانوا");
  });
  it("keeps the vowel before a و or ي that a long alif follows", () => {
    expect(houseStyle("اِرتِياحَكَ رِياحٌ طُوالٌ قُضِيا كانُوا")).toBe("اِرتِياحَكَ رِياحٌ طُوالٌ قُضِيا كانوا");
  });
  it("puts tanwin al-fath on the final alif", () => {
    expect(houseStyle("فُنُونًا هُدًى")).toBe("فُنوناً هُدىً");
  });
  it("keeps the prefix's vowel before the alif of wasl", () => {
    expect(houseStyle("وَالعَنبَرِ فَاقصُرِي وَاللَّيلِ")).toBe("وَالعَنبَرِ فَاقصُري وَاللَّيلِ");
    expect(houseStyle("وَادِي فَارِسٌ")).toBe("وادي فارِسٌ");
  });
  it("gives a sun letter after the article its shadda", () => {
    expect(houseStyle("وَبَينَ الرِضا وَالسُخطِ لِلنَدى سَقى اللَهُ اللَيلِ")).toBe("وَبَينَ الرِّضا وَالسُّخطِ لِلنَّدى سَقى اللَّهُ اللَّيلِ");
    expect(houseStyle("القَمَرِ لِلحُبِّ اِبنِ اِلتَقى")).toBe("القَمَرِ لِلحُبِّ اِبنِ اِلتَقى");
  });
  it("leaves text already in the house style alone", () => {
    for (const t of ["تَقولُ بُثَينَةُ لَمّا رَأَت", "فُنوناً مِنَ الشَّعَرِ الأَحمَرِ", "أَلا تَذكُرينَ بَلى فَاذكُري", "وَإِذ لَمَّتي كَجَناحِ الغُرابِ", "يَومَ بَينَ"])
      expect(houseStyle(t)).toBe(t);
  });
  it("never changes letters or spaces", () => {
    const t = "وَأَنتِ كَلُؤلُؤَةِ المَرزَبانِ";
    expect(houseStyle(t).replace(/[\u064B-\u0652\u0670]/g, "")).toBe(t.replace(/[\u064B-\u0652\u0670]/g, ""));
  });
});

describe("tashkeelIssues", () => {
  it("passes a fully marked half", () => {
    expect(tashkeelIssues("تَقولُ بُثَينَةُ لَمّا رَأَت")).toEqual([]);
    expect(tashkeelIssues("فَقُلتُ بُثَينُ أَلا فَاقصُري")).toEqual([]);
    expect(tashkeelIssues("لَيالِيَ نَحنُ بِذي جَهوَرِ")).toEqual([]);
    expect(tashkeelIssues("وَما كَمَدُ الحُسّادِ شَيئاً قَصَدتُهُ")).toEqual([]);
  });
  it("finds missing vowels", () => {
    expect(tashkeelIssues("قلت")).toEqual(["«قلت» starts without a vowel", "«قلت» has two silent letters in a row (لت)"]);
    expect(tashkeelIssues("بِحبٍّ")).toEqual([]);
    expect(tashkeelIssues("بِحبرِ")).toEqual(["«بِحبرِ» has two silent letters in a row (حب)"]);
    expect(tashkeelIssues("مُدّ")).toEqual(["«مُدّ» has a shadda with no vowel on د"]);
  });
});
