import type { UiLang } from "@shawared/contracts";

/** Where readers write to us: support, mistakes in the content, privacy requests. */
export const CONTACT = "easybooksdev@gmail.com";

/**
 * A part of a page: its heading and its paragraphs. A paragraph links with [its words](address):
 * a page of Shawared's ("/terms", in the reader's language), a mailto: or an https: address.
 */
export type Section = { title: string; body: string[] };

export type PageText = {
  /** The page's title, and what search engines and link previews show under it. */
  title: string;
  description: string;
  lead: string;
  sections: Section[];
};

/** A paragraph's runs of text, each a link when it has an address. */
export function runs(paragraph: string): { text: string; href?: string }[] {
  const out: { text: string; href?: string }[] = [];
  let at = 0;
  for (const m of paragraph.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
    if (m.index > at) out.push({ text: paragraph.slice(at, m.index) });
    out.push({ text: m[1]!, href: m[2]! });
    at = m.index + m[0].length;
  }
  if (at < paragraph.length) out.push({ text: paragraph.slice(at) });
  return out;
}

const EMAIL = `[${CONTACT}](mailto:${CONTACT})`;

// The App Store, Google Play and AppGallery link the support page and the privacy policy for
// the apps. Change a page's date with it.
export const PRIVACY_UPDATED: Record<UiLang, string> = { ar: "٢٠ نوفمبر ٢٠٢٦", en: "20 November 2026" };
export const TERMS_UPDATED: Record<UiLang, string> = { ar: "٢٠ نوفمبر ٢٠٢٦", en: "20 November 2026" };

export const ABOUT: Record<UiLang, PageText> = {
  ar: {
    title: "عن شوارد",
    description: "شوارد: الشعر العربي كما يُلقى، بأصوات مُلقيه، مع شرح أبياته ومعاني كلماته. من الكتب المُيسّرة.",
    lead: "شوارد مكتبة للشعر العربي كما يُلقى: تستمع إلى القصيدة بصوت مُلقيها، وتتابع أبياتها مع الإلقاء، وتفهم معانيها.",
    sections: [
      {
        title: "ما يقدّمه شوارد",
        body: [
          "قصائد عربية من العصر الجاهلي إلى اليوم، لكل منها تسجيل يُبرز البيت الذي يُلقى في أثناء الاستماع. ومع الأبيات شرحها ومعاني مفرداتها، ونبذة عن القصيدة وشاعرها، وترجمتها إلى الإنجليزية. ويمكنك تصفّح القصائد حسب الشاعر أو المُلقي أو البحر، أو البحث عنها، وحفظ ما يعجبك في المفضّلة، وإنشاء قوائم تشغيل، وتنزيل التسجيلات لسماعها دون اتصال بالإنترنت.",
          "يتوفر شوارد بواجهة عربية وإنجليزية.",
        ],
      },
      {
        title: "مصدر المحتوى",
        body: ["نص كل قصيدة مطابق لما يقوله مُلقيها، ومُقابَل بمصادرها من الدواوين والكتب، ومضبوط بالشكل كاملًا. ويُنسب كل تسجيل إلى مُلقيه."],
      },
      {
        title: "مَن يطوّر شوارد",
        body: [
          "شوارد من تطوير الكتب المُيسّرة، وهو مجاني وخالٍ من الإعلانات، ويمكنك استخدامه دون حساب.",
          "تابع الكتب المُيسّرة على [تيليجرام](https://t.me/ieasybooks) و[يوتيوب](https://youtube.com/@ieasybooks) و[X](https://x.com/iieasybooks) و[فيسبوك](https://fb.com/ieasybooks) و[GitHub](https://github.com/ieasybooks).",
        ],
      },
    ],
  },
  en: {
    title: "About Shawared",
    description:
      "Shawared: Arabic poetry as it is recited, in its reciters' voices, with its verses explained and its words glossed. By EasyBooks.",
    lead: "Shawared is a library of Arabic poetry as it is recited: hear each poem in its reciter's voice, read its verses as they are recited, and understand what they mean.",
    sections: [
      {
        title: "What's in Shawared",
        body: [
          "Arabic poems from before Islam to today, each with a recording that highlights the verse being recited. Explanations of the verses and their words, notes on each poem and poet, and an English translation. Browse by poet, reciter and meter, or search; keep favorites, make playlists and download recordings to listen offline.",
          "Its interface is in Arabic and English.",
        ],
      },
      {
        title: "Where the content comes from",
        body: [
          "Each poem's text follows what its reciter says, checked against its sources in diwans and books, and is fully vowelled. Every recording is credited to its reciter.",
        ],
      },
      {
        title: "Who makes it",
        body: [
          "Shawared is made by EasyBooks. It's free, has no ads and works without an account.",
          "Follow EasyBooks on [Telegram](https://t.me/ieasybooks), [YouTube](https://youtube.com/@ieasybooks), [X](https://x.com/iieasybooks), [Facebook](https://fb.com/ieasybooks) and [GitHub](https://github.com/ieasybooks).",
        ],
      },
    ],
  },
};

export const PRIVACY: Record<UiLang, PageText> = {
  ar: {
    title: "سياسة الخصوصية",
    description: "كيف يتعامل تطبيقا شوارد وموقع shawared.com مع المعلومات.",
    lead: "تبيّن هذه السياسة كيف نتعامل مع المعلومات في تطبيق شوارد على iOS وAndroid وموقع shawared.com. شوارد من تطوير الكتب المُيسّرة، ويمكنك استخدامه دون حساب.",
    sections: [
      {
        title: "ما يُحفظ على جهازك",
        body: [
          "يحفظ شوارد على جهازك اختياراتك للغة والمظهر، وهل تُشغَّل القصيدة التالية تلقائيًا، والقصائد التي فتحتها، ومكتبتك من القصائد والشعراء والمُلقين المفضّلين وقوائم التشغيل. وتُحفظ عليه كذلك التسجيلات التي تنزّلها في التطبيق لتسمعها دون اتصال.",
          "ولا يُرسَل شيء من ذلك إلينا، ويمكنك حذفه بمسح بيانات التطبيق أو الموقع.",
        ],
      },
      {
        title: "الإعلانات والإحصاءات",
        body: [
          "لا يعرض شوارد إعلانات، ولا يتتبّعك في التطبيقات أو المواقع الأخرى. ويجمع موقع shawared.com إحصاءات إجمالية عن زياراته وسرعة تحميل صفحاته، دون استخدام ملفات تعريف الارتباط. ولا نبيع أي بيانات، ولا نستخدمها لأغراض إعلانية.",
        ],
      },
      {
        title: "الأذونات",
        body: ["لا يطلب شوارد إذن الوصول إلى موقعك الجغرافي أو الكاميرا أو الميكروفون أو جهات الاتصال."],
      },
      {
        title: "التواصل وطلبات الخصوصية",
        body: [
          `إذا راسلتنا، نتلقى ما ترسله إلينا، كاسمك وبريدك الإلكتروني ونص رسالتك، ولا نستخدمه إلا للرد عليك. ولأي سؤال عن الخصوصية، أو لطلب حذف رسائلك، راسلنا على ${EMAIL}.`,
        ],
      },
      {
        title: "تحديثات هذه السياسة",
        body: ["ننشر في هذه الصفحة النسخة الحالية من هذه السياسة، مع تاريخ آخر تحديث لها."],
      },
    ],
  },
  en: {
    title: "Privacy policy",
    description: "How the Shawared apps and shawared.com handle information.",
    lead: "This policy explains how the Shawared apps for iOS and Android and the shawared.com website handle information. Shawared is made by EasyBooks, and you can use it without an account.",
    sections: [
      {
        title: "Information stored on your device",
        body: [
          "Shawared saves on your device your language and appearance choices, whether the next poem plays by itself, the poems you've opened, and your library: favorite poems, poets and reciters, and playlists. Recordings you download in the apps are stored there too, so you can listen offline.",
          "None of this is sent to us, and you can remove it by clearing the app's or the site's data.",
        ],
      },
      {
        title: "Advertising and analytics",
        body: [
          "Shawared has no ads and doesn't track you across apps or websites. The shawared.com website keeps aggregate statistics on its visits and loading speed, without cookies. We don't sell any data or use it for advertising.",
        ],
      },
      {
        title: "Permissions",
        body: ["Shawared doesn't ask for access to your location, camera, microphone or contacts."],
      },
      {
        title: "Contact and privacy requests",
        body: [
          `If you write to us, we receive what you send, such as your name, email address and message, and use it only to reply to you. To ask about privacy, or to have your messages deleted, email ${EMAIL}.`,
        ],
      },
      {
        title: "Changes to this policy",
        body: ["We publish the current version of this policy, and the date it was last updated, on this page."],
      },
    ],
  },
};

export const TERMS: Record<UiLang, PageText> = {
  ar: {
    title: "شروط الاستخدام",
    description: "شروط استخدام تطبيق شوارد وموقع shawared.com.",
    lead: "تنظّم هذه الشروط استخدامك لتطبيق شوارد على iOS وAndroid وموقع shawared.com، ويُعدّ استخدامك له موافقةً عليها. شوارد من تطوير الكتب المُيسّرة، وهو مجاني.",
    sections: [
      {
        title: "استخدام شوارد",
        body: [
          "استخدم شوارد استخدامًا مشروعًا ولائقًا، ولا تحاول تعطيله، أو الوصول إلى أجزاء غير مسموح لك بها، أو إرسال طلبات كثيرة تُبطئه على المستخدمين الآخرين.",
        ],
      },
      {
        title: "المحتوى والحقوق",
        body: [
          "ينسب شوارد كل قصيدة إلى شاعرها، وكل تسجيل إلى مُلقيه. وتبقى الحقوق كلها لأصحابها، ولا يدّعي شوارد ملكية شيء منها.",
          `إذا كنت صاحب حق في مادة يعرضها شوارد، وأردت تصحيحها أو تعديل نسبتها أو حذفها، فراسلنا على ${EMAIL}، وأرفق رابطها وبيّن صلتك بها. ونحن نراجع كل طلب ونتخذ الإجراء المناسب.`,
        ],
      },
      {
        title: "الدقة والتوافر",
        body: [
          "يُقدَّم شوارد مجانًا و«كما هو»، دون ضمانات من أي نوع. وقد يتغير محتواه أو يصبح غير متاح أو تقع فيه أخطاء، ولا نضمن أن يعمل دائمًا أو يخلو من الأعطال. وإن وجدت خطأ، فنرجو أن تبلغنا به.",
        ],
      },
      {
        title: "حدود المسؤولية",
        body: [
          "في حدود ما يسمح به القانون، لا تتحمل الكتب المُيسّرة أي مسؤولية عن خسارة أو ضرر ينشأ عن استخدام شوارد أو محتواه، أو عن تعذّر استخدامهما.",
        ],
      },
      {
        title: "تحديثات هذه الشروط",
        body: [
          "قد نحدّث هذه الشروط من حين لآخر، وننشر نسختها الحالية في هذه الصفحة مع تاريخ آخر تحديث. واستمرارك في استخدام شوارد بعد التحديث يعني قبولك للشروط المحدّثة.",
        ],
      },
      {
        title: "التواصل",
        body: [`لأي سؤال عن هذه الشروط، راسلنا على ${EMAIL}.`],
      },
    ],
  },
  en: {
    title: "Terms of use",
    description: "The terms of use of the Shawared apps and shawared.com.",
    lead: "These terms cover your use of the Shawared apps for iOS and Android and the shawared.com website. By using Shawared, you agree to them. Shawared is made by EasyBooks and is free.",
    sections: [
      {
        title: "Using Shawared",
        body: [
          "Use Shawared lawfully and respectfully. Don't disrupt it, try to get into parts of it you aren't allowed to reach, or send it so many requests that it slows down for others.",
        ],
      },
      {
        title: "Content and rights",
        body: [
          "Shawared credits each poem to its poet and each recording to its reciter. Their rights stay with their owners, and Shawared claims no ownership of them.",
          `If you own rights in something Shawared shows and want it corrected, credited differently or removed, email ${EMAIL} with a link to it and your relationship to it. We review every request and act on it.`,
        ],
      },
      {
        title: "Accuracy and availability",
        body: [
          "Shawared is provided free and as is, without warranties of any kind. Its content may change, become unavailable or contain mistakes, and we don't guarantee that it will always work or be free of errors. If you find a mistake, please report it.",
        ],
      },
      {
        title: "Limitation of liability",
        body: [
          "As far as the law allows, EasyBooks isn't liable for any loss or damage arising from using, or being unable to use, Shawared or its content.",
        ],
      },
      {
        title: "Changes to these terms",
        body: [
          "We may update these terms. We publish the current version here, with the date it was last updated. Continuing to use Shawared after an update means you accept it.",
        ],
      },
      {
        title: "Contact",
        body: [`For questions about these terms, email ${EMAIL}.`],
      },
    ],
  },
};

// The support page the stores link: how to reach us, what helps in a report, and where rights
// holders and privacy requests go. Mofied's and Faqieh's support pages follow the same outline.
export const SUPPORT: Record<UiLang, PageText> = {
  ar: {
    title: "التواصل والدعم",
    description: "كيف تراسل فريق شوارد للأسئلة والدعم والإبلاغ عن الأخطاء.",
    lead: "شوارد من تطوير الكتب المُيسّرة. لأي سؤال أو اقتراح، أو للإبلاغ عن مشكلة أو خطأ، تواصل معنا.",
    sections: [
      {
        title: "راسلنا",
        body: [
          `بريدنا الإلكتروني للأسئلة والدعم وطلبات الخصوصية: ${EMAIL}. ويمكنك كذلك [فتح بلاغ على GitHub](https://github.com/ieasybooks/shawared/issues)، وهو علني، فلا تضع فيه معلومات شخصية.`,
        ],
      },
      {
        title: "الإبلاغ عن مشكلة",
        body: [
          "إن كانت ملاحظتك عن شيء محدد في شوارد، فأرسل رابطه أو أخبرنا بمكانه. وإن كانت المشكلة في عمل التطبيق أو الموقع، فاذكر نوع جهازك، وإصدار نظام تشغيله، وإصدار شوارد، وما حدث قبل ظهورها. ولا ترسل إلينا كلمات مرور أو أي معلومات حساسة.",
        ],
      },
      {
        title: "المحتوى والحقوق",
        body: ["إذا كنت صاحب حق في مادة يعرضها شوارد، فراجع قسم «المحتوى والحقوق» في [شروط الاستخدام](/terms)، أو راسلنا."],
      },
      {
        title: "الخصوصية",
        body: [
          "يمكنك استخدام شوارد دون حساب، وهو لا يتتبّعك في التطبيقات أو المواقع الأخرى. ولمعرفة كيف نتعامل مع المعلومات، أو لتقديم طلب يتعلق بالخصوصية، راجع [سياسة الخصوصية](/privacy).",
        ],
      },
    ],
  },
  en: {
    title: "Contact & support",
    description: "How to reach the Shawared team for questions, support and reporting mistakes.",
    lead: "Shawared is made by EasyBooks. For questions and suggestions, or to report a problem or a mistake, contact us.",
    sections: [
      {
        title: "Email us",
        body: [
          `Our address for questions, support and privacy requests: ${EMAIL}. You can also [open an issue on GitHub](https://github.com/ieasybooks/shawared/issues); it's public, so keep personal information out of it.`,
        ],
      },
      {
        title: "Reporting a problem",
        body: [
          "If it's about something specific in Shawared, send its link or tell us where to find it. If it's about the app or the website, include your device, its operating system version, Shawared's version and what happened before it. Don't send passwords or sensitive information.",
        ],
      },
      {
        title: "Content and rights",
        body: ["If you own rights in something Shawared shows, see “Content and rights” in [the terms of use](/terms), or email us."],
      },
      {
        title: "Privacy",
        body: [
          "Shawared works without an account and doesn't track you across apps or websites. For how we handle information, or for a privacy request, see [the privacy policy](/privacy).",
        ],
      },
    ],
  },
};
