---
layout: default
permalink: /blog/
title: blog
body_class: blog-ledger-page
nav: true
nav_order: 2
pagination:
  enabled: true
  collection: posts
  permalink: /page/:num/
  per_page: 5
  sort_field: date
  sort_reverse: true
  trail:
    before: 1 # The number of links before the current page
    after: 3 # The number of links after the current page
---

<div class="post blog-page blog-page--ledger">

{% if page.pagination.enabled %}
{% assign postlist = paginator.posts %}
{% else %}
{% assign postlist = site.posts %}
{% endif %}

{% assign total_posts = site.posts | size %}
{% assign latest_post = site.posts | first %}
{% assign latest_post_date = latest_post.date | date: "%B %Y" %}
{% assign has_blog_topics = false %}
{% if site.display_tags and site.display_tags.size > 0 or site.display_categories and site.display_categories.size > 0 %}
{% assign has_blog_topics = true %}
{% endif %}

<section class="blog-hero">
  <div class="blog-hero__panel">
    <div class="blog-hero__copy">
      <h1 class="blog-hero__title">Blog</h1>
      <p class="blog-hero__subtitle">
        Notes on machine learning foundations, language models, AI agents, and hands-on engineering.
      </p>
    </div>
  </div>
</section>

{% if has_blog_topics or latest_post %}

  <aside class="blog-side-rail" aria-label="Blog topics and summary">
    {% if has_blog_topics %}
      <section class="blog-side-rail__section blog-side-rail__section--topics">
        <p class="blog-side-rail__eyebrow">Topics</p>
        <div class="blog-side-rail__links">
          {% for tag in site.display_tags %}
            <a class="blog-side-rail__link" href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">
              <i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}
            </a>
          {% endfor %}
          {% for category in site.display_categories %}
            <a class="blog-side-rail__link" href="{{ category | slugify | prepend: '/blog/category/' | relative_url }}">
              <i class="fa-solid fa-tag fa-sm"></i> {{ category }}
            </a>
          {% endfor %}
        </div>
      </section>
    {% endif %}
    <section class="blog-side-rail__section blog-side-rail__section--glance" aria-label="Blog overview">
      <p class="blog-side-rail__eyebrow">At a glance</p>
      <dl class="blog-side-rail__list">
        <div class="blog-side-rail__metric">
          <dt>Posts</dt>
          <dd>{{ total_posts }}</dd>
        </div>
        {% if latest_post %}
          <div class="blog-side-rail__metric">
            <dt>Latest update</dt>
            <dd>{{ latest_post_date }}</dd>
          </div>
        {% endif %}
      </dl>
    </section>
  </aside>
{% endif %}

  <section class="blog-archive">
    <ul class="post-list post-list--editorial">
      {% for post in postlist %}
        {% if post.external_source == blank %}
          {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
        {% else %}
          {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
        {% endif %}
        {% assign year = post.date | date: "%Y" %}
        {% assign post_month = post.date | date: "%b" %}
        {% assign post_day = post.date | date: "%d" %}
        {% assign post_year_full = post.date | date: "%Y" %}
        {% assign post_primary_category = post.categories | first %}
        {% assign tags = post.tags | join: "" %}
        {% assign categories = post.categories | join: "" %}
        {% assign post_href = post.url | relative_url %}
        {% assign post_external_redirect = false %}
        {% if post.redirect %}
          {% if post.redirect contains '://' %}
            {% assign post_href = post.redirect %}
            {% assign post_external_redirect = true %}
          {% else %}
            {% assign post_href = post.redirect | relative_url %}
          {% endif %}
        {% endif %}

        <li class="post-list__item{% if post.thumbnail %} post-list__item--with-thumb{% else %} post-list__item--text-only{% endif %}">
          <div class="post-list__date-block" aria-hidden="true">
            <span class="post-list__month">{{ post_month }}</span>
            <span class="post-list__day">{{ post_day }}</span>
            <span class="post-list__year">{{ post_year_full }}</span>
          </div>
          <div class="post-list__body">
            <p class="post-list__eyebrow">
              {% if post_primary_category %}
                {{ post_primary_category }}
              {% else %}
                Essay
              {% endif %}
              &nbsp; &middot; &nbsp; {{ read_time }} min read
              {% if post.external_source %}
                &nbsp; &middot; &nbsp; {{ post.external_source }}
              {% endif %}
            </p>
            <h3 class="post-list__title">
              <a class="post-title" href="{{ post_href }}"{% if post_external_redirect %} target="_blank" rel="noopener noreferrer"{% endif %}>{{ post.title }}</a>
            </h3>
            {% if post.description %}
              <p class="post-list__description">{{ post.description }}</p>
            {% endif %}
            <p class="post-tags post-list__taxonomy">
              <a href="{{ year | prepend: '/blog/' | relative_url }}">
                <i class="fa-solid fa-calendar fa-sm"></i> {{ year }}
              </a>
              {% if tags != "" %}
                &nbsp; &middot; &nbsp;
                {% for tag in post.tags %}
                  <a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">
                    <i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}
                  </a>
                  {% unless forloop.last %}
                    &nbsp;
                  {% endunless %}
                {% endfor %}
              {% endif %}
              {% if categories != "" %}
                &nbsp; &middot; &nbsp;
                {% for category in post.categories %}
                  <a href="{{ category | slugify | prepend: '/blog/category/' | relative_url }}">
                    <i class="fa-solid fa-tag fa-sm"></i> {{ category }}
                  </a>
                  {% unless forloop.last %}
                    &nbsp;
                  {% endunless %}
                {% endfor %}
              {% endif %}
            </p>
          </div>
          {% if post.thumbnail %}
            <a class="post-list__thumb" href="{{ post_href }}"{% if post_external_redirect %} target="_blank" rel="noopener noreferrer"{% endif %}>
              <img src="{{ post.thumbnail | relative_url }}" alt="{{ post.title }}">
            </a>
          {% endif %}
        </li>
      {% endfor %}
    </ul>

  </section>

{% if page.pagination.enabled %}
{% include pagination.liquid %}
{% endif %}

</div>
