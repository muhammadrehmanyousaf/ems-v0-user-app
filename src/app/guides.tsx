/**
 * Wedding guides — links out to the real articles on weddingwala.pk.
 * Redrawn on v4.
 *
 * ── What was wrong ────────────────────────────────────────────────────────
 *
 * · **Every group was a bordered `Card`.** Five elevated boxes holding thirty
 *   rows — the pattern rules.md §0.0 names in its "before" column, on a screen
 *   that is nothing but a list of links. `ListGroup` + `ListRow` already exist
 *   for exactly this: they were built for the Account tab and this is the same
 *   shape.
 *
 * · **A gold icon on every row.** Thirty gold glyphs down one screen. The rows
 *   are already grouped under a heading that names the category; repeating the
 *   category's icon on each of its six children says nothing and spends the
 *   accent thirty times.
 *
 * · **The chevron was the wrong promise.** These rows leave the app for an
 *   in-app browser. `ListRow`'s `to="external"` draws the outward arrow rather
 *   than a chevron, which is why that prop exists — a chevron says "further in",
 *   and further in is not where this goes.
 *
 * · A hand-rolled header instead of `ScreenHeader`, `group.title.toUpperCase()`
 *   fed into `Section` (which sets its title at `h2` 22 Fraunces, so the
 *   headings rendered as shouted display caps), plus `colors.ivory` and
 *   `spacing['3xl']` — both deprecated v3 aliases.
 *
 * ── Why the guide titles stay English ─────────────────────────────────────
 *
 * They are the titles of real English articles on weddingwala.pk, and each row
 * opens that article. An Urdu label over an English page is a worse promise than
 * an English label, so the CONTENT stays as published and only the chrome —
 * title, subtitle, back — is translated.
 */
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView, View } from 'react-native';

import { ListGroup, ListRow, ScreenHeader, Text } from '@/components/ui';
import { GUIDE_GROUPS, WEB_BASE } from '@/features/guides/guides';
import { useT } from '@/i18n/useT';
import { haptics, layout, useTheme } from '@/theme';

export default function Guides() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();

  const open = (slug: string) => {
    haptics.light();
    WebBrowser.openBrowserAsync(`${WEB_BASE}/${slug}`, {
      // `screen` and `textPrimary`, not the deprecated `ivory`/`goldDark`
      // aliases — the browser chrome should read as the same paper the app is
      // printed on, not as a second brand.
      toolbarColor: t.colors.screen,
      controlsColor: t.colors.textPrimary,
      dismissButtonStyle: 'close',
    }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <ScreenHeader
        title={tr('guides.title')}
        onBack={() => router.back()}
        backLabel={tr('common.back')}
        urdu={isUrdu}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingBottom: t.spacing.vast,
          gap: t.spacing.huge,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="body" tone="muted" urdu={isUrdu}>
          {tr('guides.subtitle')}
        </Text>

        {GUIDE_GROUPS.map((group) => (
          <ListGroup key={group.title} title={group.title} urdu={isUrdu}>
            {group.guides.map((g, i) => (
              // No icon. `ListRow` reserves no space for a missing one, so
              // putting the group glyph on only the first row would have left
              // that row's label 28px out of line with its five siblings — and
              // putting it on all six repeats one identical mark under a
              // heading that already names the category.
              <ListRow
                key={g.slug}
                label={g.title}
                to="external"
                onPress={() => open(g.slug)}
                last={i === group.guides.length - 1}
              />
            ))}
          </ListGroup>
        ))}
      </ScrollView>
    </View>
  );
}
