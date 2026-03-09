import { buildRssFeed, escapeXml } from '../rss';

describe('escapeXml', () => {
  it('escapes ampersands first to prevent double-escaping', () => {
    expect(escapeXml('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than and greater-than', () => {
    expect(escapeXml('<tag>')).toBe('&lt;tag&gt;');
  });

  it('escapes double quotes', () => {
    expect(escapeXml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeXml('it\'s')).toBe('it&apos;s');
  });

  it('escapes all special characters together without double-escaping', () => {
    expect(escapeXml('<a href="x&y">it\'s</a>')).toBe('&lt;a href=&quot;x&amp;y&quot;&gt;it&apos;s&lt;/a&gt;');
  });

  it('leaves plain text unchanged', () => {
    expect(escapeXml('hello world')).toBe('hello world');
  });
});

describe('buildRssFeed', () => {
  const item = `    <item>
      <title>Test Item</title>
      <link>https://example.com/1</link>
      <guid isPermaLink="true">https://example.com/1</guid>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
      <description>Test Item</description>
    </item>`;

  it('produces valid RSS 2.0 XML', () => {
    const feed = buildRssFeed('Feed Title', 'https://example.com', 'Feed description', [item]);
    expect(feed).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(feed).toContain('<rss version="2.0">');
    expect(feed).toContain('</rss>');
  });

  it('includes channel metadata', () => {
    const feed = buildRssFeed('My Feed', 'https://example.com', 'My description', []);
    expect(feed).toContain('<title>My Feed</title>');
    expect(feed).toContain('<link>https://example.com</link>');
    expect(feed).toContain('<description>My description</description>');
    expect(feed).toContain('<language>zh-tw</language>');
  });

  it('XML-escapes the channel title and description', () => {
    const feed = buildRssFeed('Title & More', 'https://example.com', 'Desc <b>bold</b>', []);
    expect(feed).toContain('<title>Title &amp; More</title>');
    expect(feed).toContain('<description>Desc &lt;b&gt;bold&lt;/b&gt;</description>');
  });

  it('includes all provided items', () => {
    const items = [item, item.replace('Test Item', 'Second Item')];
    const feed = buildRssFeed('Feed', 'https://example.com', 'desc', items);
    expect(feed).toContain('Test Item');
    expect(feed).toContain('Second Item');
  });

  it('produces an empty channel when no items are given', () => {
    const feed = buildRssFeed('Empty Feed', 'https://example.com', 'No items', []);
    expect(feed).toContain('<channel>');
    expect(feed).toContain('</channel>');
    expect(feed).not.toContain('<item>');
  });
});
