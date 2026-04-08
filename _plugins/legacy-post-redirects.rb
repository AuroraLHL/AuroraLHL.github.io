module LegacyPostRedirects
  class RedirectPage < Jekyll::PageWithoutAFile
    def initialize(site, dir, post)
      super(site, site.source, dir, "index.html")

      self.data = {
        "layout" => "default",
        "title" => post.data["title"],
        "description" => post.data["description"],
        "redirect" => post.url,
        "redirect_delay" => 0,
        "canonical_url" => post.url,
        "robots" => "noindex, follow",
        "sitemap" => false,
      }

      self.content = ""
    end
  end

  class Generator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      site.posts.docs.each do |post|
        legacy_slug = legacy_slug_for(post)
        next if legacy_slug.nil? || legacy_slug.empty?

        site.pages << RedirectPage.new(site, File.join("posts", legacy_slug), post)
      end
    end

    private

    def legacy_slug_for(post)
      basename = File.basename(post.path, File.extname(post.path))
      match = basename.match(/\A\d{4}-\d{2}-\d{2}-(.+)\z/)
      return match[1] if match

      basename
    end
  end
end
