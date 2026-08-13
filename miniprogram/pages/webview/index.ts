Page({
  data: { url: "" },
  onLoad(options: Record<string, string | undefined>) {
    const value = options.url ? decodeURIComponent(options.url) : "";
    if (/^https:\/\/[A-Za-z0-9.-]+(?::[1-9][0-9]{0,4})?\//.test(value))
      this.setData({ url: value });
  },
});
