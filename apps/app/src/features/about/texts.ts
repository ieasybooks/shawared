import type { UiLang } from "@shawared/contracts";

/** Where readers write to us: support, mistakes in the content, privacy requests. */
export const CONTACT = "easybooksdev@gmail.com";

/** A part of a page: its heading, its paragraphs, and what it links to after them. */
export type Section = { title: string; body: string[]; email?: boolean; privacy?: boolean };

export type PageText = {
  /** The page's title, and what search engines and link previews show under it. */
  title: string;
  description: string;
  lead: string;
  sections: Section[];
};

// The App Store, Google Play and AppGallery link these pages as the apps' support page and
// privacy policy. Change the privacy policy's date with it.
export const PRIVACY_UPDATED: Record<UiLang, string> = { ar: "١٨ نوفمبر ٢٠٢٦", en: "18 November 2026" };

export const ABOUT: Record<UiLang, PageText> = {
  ar: {
    title: "عن شوارد",
    description: "شوارد: الشعر العربي كما يُلقى، بأصوات مُلقيه، مع شرح أبياته ومعاني كلماته. من مبادرة الكتب المُيسّرة.",
    lead: "شوارد مكتبة للشعر العربي كما يُلقى: تسمع القصيدة بصوت مُلقيها، وتقرأ أبياتها وهي تُلقى، وتفهم معانيها.",
    sections: [
      {
        title: "ما في شوارد",
        body: [
          "قصائد من الشعر العربي، من الجاهلية إلى اليوم، لكل منها تسجيل يضيء معه البيت الذي يُلقى وأنت تستمع.",
          "ومع الأبيات شرحها ومعاني كلماتها، ونبذة عن القصيدة وشاعرها، وترجمتها في الواجهة الإنجليزية.",
          "وتتصفح القصائد بشعرائها ومُلقيها وبحورها، أو تبحث عنها بعنوانها أو مطلعها.",
        ],
      },
      {
        title: "النص والتسجيل",
        body: ["يتبع نص كل قصيدة ما يقوله مُلقيها، بعد مقابلته بمصادرها من الدواوين والكتب، ويُضبط بالشكل. وكل تسجيل منسوب إلى مُلقيه."],
      },
      {
        title: "من يصنعه",
        body: ["شوارد من تطوير مبادرة الكتب المُيسّرة. وهو مجاني، بلا إعلانات ولا حسابات."],
      },
      {
        title: "التواصل والدعم",
        body: [
          "للأسئلة والاقتراحات، أو للإبلاغ عن خطأ في نص أو شرح أو تسجيل، راسلنا.",
          "إن كان الخطأ في قصيدة فاذكرها واذكر رقم البيت، وإن كانت المشكلة في التطبيق فاذكر نوع جهازك وإصدار شوارد وما حدث قبلها.",
        ],
        email: true,
      },
      {
        title: "الخصوصية",
        body: ["لا يحتاج شوارد إلى حساب، ولا يتتبعك."],
        privacy: true,
      },
    ],
  },
  en: {
    title: "About Shawared",
    description:
      "Shawared: Arabic poetry as it is recited, in its reciters' voices, with its verses explained and its words glossed. By the EasyBooks initiative.",
    lead: "Shawared is a library of Arabic poetry as it is recited: hear each poem in its reciter's voice, read its verses as they are recited, and understand what they mean.",
    sections: [
      {
        title: "What's in Shawared",
        body: [
          "Arabic poems, from before Islam to today, each with a recording that lights up the verse being recited as you listen.",
          "With the verses come their explanations and the meanings of their words, notes on the poem and its poet, and an English translation.",
          "Browse the poems by poet, reciter and meter, or search for one by its title or opening line.",
        ],
      },
      {
        title: "The text and the recording",
        body: [
          "Each poem's text follows what its reciter says, checked against its sources in diwans and books, and is fully vowelled. Every recording is credited to its reciter.",
        ],
      },
      {
        title: "Who makes it",
        body: ["Shawared is made by the EasyBooks initiative. It's free, with no ads and no accounts."],
      },
      {
        title: "Contact and support",
        body: [
          "For questions and suggestions, or to report a mistake in a text, an explanation or a recording, email us.",
          "If the mistake is in a poem, name the poem and the verse; if the problem is in the app, include your device, Shawared's version and what happened before it.",
        ],
        email: true,
      },
      {
        title: "Privacy",
        body: ["Shawared needs no account and doesn't track you."],
        privacy: true,
      },
    ],
  },
};

export const PRIVACY: Record<UiLang, PageText> = {
  ar: {
    title: "سياسة الخصوصية",
    description: "كيف يتعامل تطبيقا شوارد وموقع shawared.com مع المعلومات.",
    lead: "توضح هذه السياسة كيف يتعامل تطبيقا شوارد على iOS وAndroid وموقع shawared.com مع المعلومات. شوارد من تطوير مبادرة الكتب المُيسّرة، ولا يحتاج استخدامه إلى حساب.",
    sections: [
      {
        title: "ما يُحفظ على جهازك",
        body: [
          "يحفظ شوارد على جهازك اختيارك للغة والمظهر، وهل تُشغَّل القصيدة التالية تلقائيًا، ليتذكر ذلك في المرة القادمة. ويحفظ التطبيقان القصائد التي فتحتها، لتُفتح بسرعة ودون اتصال.",
          "لا يُرسَل شيء من ذلك إلينا، ويمكنك إزالته بمسح بيانات التطبيق أو الموقع.",
        ],
      },
      {
        title: "تحميل القصائد والتسجيلات",
        body: [
          "يحمّل شوارد القصائد من shawared.com والتسجيلات من audio.shawared.com عبر HTTPS، وتستضيفهما Cloudflare. وتحمل هذه الطلبات معلومات تقنية، مثل عنوان الإنترنت ووقت الطلب والملف المطلوب ونوع المتصفح أو التطبيق، قد تسجلها Cloudflare لتوصيل المحتوى وحماية الخدمة من إساءة الاستخدام.",
          "لا يطلب شوارد إذنًا بالوصول إلى موقعك أو الكاميرا أو الميكروفون أو جهات الاتصال.",
        ],
      },
      {
        title: "الإعلانات والتحليلات",
        body: [
          "لا يتضمن تطبيقا شوارد إعلانات ولا أدوات تحليل، ولا يتتبعانك عبر التطبيقات أو المواقع.",
          "ويستخدم موقع shawared.com خدمة Cloudflare Web Analytics لإحصاءات إجمالية عن زياراته وسرعته، دون ملفات تعريف ارتباط. لا نبيع أي بيانات، ولا نستخدمها للإعلانات.",
        ],
      },
      {
        title: "الروابط الخارجية",
        body: ["قد تفتح بعض الروابط، مثل قنوات المُلقين على يوتيوب، مواقع أو تطبيقات أخرى تسري عليها سياسات خصوصيتها."],
      },
      {
        title: "التواصل وطلبات الخصوصية",
        body: [
          "إذا راسلتنا، نتلقى ما تختار إرساله، مثل بريدك الإلكتروني ونص رسالتك، لنرد عليك.",
          "للسؤال عن الخصوصية، أو لطلب حذف مراسلاتك، راسلنا. ليس في شوارد حسابات، فلا حساب يُحذف.",
        ],
        email: true,
      },
      {
        title: "تحديث السياسة",
        body: ["ننشر النسخة الحالية من هذه السياسة وتاريخ تحديثها في هذه الصفحة."],
      },
    ],
  },
  en: {
    title: "Privacy policy",
    description: "How the Shawared apps and shawared.com handle information.",
    lead: "This policy covers the Shawared apps for iOS and Android and the shawared.com website. Shawared is made by the EasyBooks initiative, and using it needs no account.",
    sections: [
      {
        title: "Information stored on your device",
        body: [
          "Shawared saves your language and appearance choices, and whether the next poem plays by itself, on your device, so it remembers them next time. The apps also keep the poems you've opened, so they open quickly and offline.",
          "None of this is sent to us, and you can remove it by clearing the app's or the site's data.",
        ],
      },
      {
        title: "Loading poems and recordings",
        body: [
          "Shawared loads poems from shawared.com and recordings from audio.shawared.com over HTTPS, both hosted by Cloudflare. These requests carry technical information, such as your IP address, the time, the file requested and your browser or app, which Cloudflare may record to deliver the content and protect the service from abuse.",
          "Shawared doesn't ask for access to your location, camera, microphone or contacts.",
        ],
      },
      {
        title: "Advertising and analytics",
        body: [
          "The Shawared apps contain no advertising and no analytics, and don't track you across apps or websites.",
          "The shawared.com website uses Cloudflare Web Analytics for aggregate statistics on its visits and speed, without cookies. We don't sell any data or use it for advertising.",
        ],
      },
      {
        title: "External links",
        body: ["Some links, such as reciters' YouTube channels, open other websites or apps, which have their own privacy policies."],
      },
      {
        title: "Contact and privacy requests",
        body: [
          "If you email us, we receive what you choose to send, such as your email address and your message, to reply to you.",
          "To ask about privacy, or to have your correspondence deleted, email us. Shawared has no accounts, so there is no account to delete.",
        ],
        email: true,
      },
      {
        title: "Changes to this policy",
        body: ["We publish the current version of this policy, and the date it was last updated, on this page."],
      },
    ],
  },
};
