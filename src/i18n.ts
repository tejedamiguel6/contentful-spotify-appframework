import { i18n } from '@lingui/core';

// Contentful's field editors (e.g. JsonEditor) translate their messages with
// Lingui, which throws if no locale is active. English with no catalog makes
// them fall back to their built-in English text.
i18n.loadAndActivate({ locale: 'en', messages: {} });
