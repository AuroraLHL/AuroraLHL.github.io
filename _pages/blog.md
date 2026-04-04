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

{% assign featured_in_page = postlist | where_exp: "post", "post.featured == true" %}
{% assign lead_post = featured_in_page | first %}
{% if lead_post == nil %}
{% assign lead_post = postlist | first %}
{% endif %}

{% assign is_paginated_index = false %}
{% if page.pagination.enabled and paginator.page == 1 %}
{% assign is_paginated_index = true %}
{% endif %}
{% assign show_lead_post = false %}
{% if is_paginated_index and lead_post %}
{% assign show_lead_post = true %}
{% endif %}

{% assign total_posts = site.posts | size %}
{% assign latest_post = site.posts | first %}
{% assign latest_post_date = latest_post.date | date: "%B %Y" %}

<section class="blog-hero">
  <div class="blog-hero__panel">
    <div class="blog-hero__copy">
      <p class="blog-hero__eyebrow">Research Ledger</p>
      <h1 class="blog-hero__title">Blog</h1>
      <p class="blog-hero__subtitle">
        Notes on machine learning foundations, language models, AI agents, and hands-on engineering.
      </p>
    </div>
    <aside class="blog-hero__ledger" aria-label="Blog overview">
      <p class="blog-hero__ledger-title">At a glance</p>
      <div class="blog-hero__metric">
        <span>Posts</span>
        <strong>{{ total_posts }}</strong>
      </div>
      {% if latest_post %}
        <div class="blog-hero__metric">
          <span>Latest update</span>
          <strong>{{ latest_post_date }}</strong>
        </div>
      {% endif %}
      <p class="blog-hero__note">Technical notes, research digests, and implementation write-ups.</p>
    </aside>
  </div>
</section>

{% if site.display_tags and site.display_tags.size > 0 or site.display_categories and site.display_categories.size > 0 %}

  <section class="blog-topics" aria-label="Blog topics">
    <p class="blog-topics__label">Topics</p>
    <div class="blog-topics__inner">
      {% for tag in site.display_tags %}
        <a class="blog-topics__item" href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">
          <i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}
        </a>
      {% endfor %}
      {% for category in site.display_categories %}
        <a class="blog-topics__item" href="{{ category | slugify | prepend: '/blog/category/' | relative_url }}">
          <i class="fa-solid fa-tag fa-sm"></i> {{ category }}
        </a>
      {% endfor %}
    </div>
  </section>
{% endif %}

{% if show_lead_post %}
{% if lead_post.external_source == blank %}
{% assign lead_read_time = lead_post.content | number_of_words | divided_by: 180 | plus: 1 %}
{% else %}
{% assign lead_read_time = lead_post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
{% endif %}
{% assign lead_year = lead_post.date | date: "%Y" %}
{% assign lead_tags = lead_post.tags | join: "" %}
{% assign lead_categories = lead_post.categories | join: "" %}
{% assign lead_href = lead_post.url | relative_url %}
{% assign lead_external_redirect = false %}
{% if lead_post.redirect %}
{% if lead_post.redirect contains '://' %}
{% assign lead_href = lead_post.redirect %}
{% assign lead_external_redirect = true %}
{% else %}
{% assign lead_href = lead_post.redirect | relative_url %}
{% endif %}
{% endif %}

  <section class="blog-lead{% unless lead_post.thumbnail %} blog-lead--text-only{% endunless %}">
    <div class="blog-lead__content">
      <p class="blog-lead__label">Featured Note</p>
      <h2 class="blog-lead__title">
        <a href="{{ lead_href }}"{% if lead_external_redirect %} target="_blank" rel="noopener noreferrer"{% endif %}>{{ lead_post.title }}</a>
      </h2>
      {% if lead_post.description %}
        <p class="blog-lead__description">{{ lead_post.description }}</p>
      {% endif %}
      <p class="blog-lead__meta">
        {{ lead_read_time }} min read &nbsp; &middot; &nbsp; {{ lead_post.date | date: '%B %d, %Y' }}
        {% if lead_post.external_source %}
          &nbsp; &middot; &nbsp; {{ lead_post.external_source }}
        {% endif %}
      </p>
      <p class="blog-lead__taxonomy">
        <a href="{{ lead_year | prepend: '/blog/' | relative_url }}">
          <i class="fa-solid fa-calendar fa-sm"></i> {{ lead_year }}
        </a>
        {% if lead_tags != "" %}
          &nbsp; &middot; &nbsp;
          {% for tag in lead_post.tags %}
            <a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">
              <i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}
            </a>
            {% unless forloop.last %}
              &nbsp;
            {% endunless %}
          {% endfor %}
        {% endif %}
        {% if lead_categories != "" %}
          &nbsp; &middot; &nbsp;
          {% for category in lead_post.categories %}
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
    {% if lead_post.thumbnail %}
      <a class="blog-lead__visual" href="{{ lead_href }}"{% if lead_external_redirect %} target="_blank" rel="noopener noreferrer"{% endif %}>
        <img src="{{ lead_post.thumbnail | relative_url }}" alt="{{ lead_post.title }}">
      </a>
    {% endif %}
  </section>
{% endif %}

  <section class="blog-archive">
    <div class="blog-archive__header">
      <div>
        <p class="blog-archive__eyebrow">Archive</p>
        <h2>Recent Essays</h2>
      </div>
      <p class="blog-archive__note">A running index of long-form notes on machine learning, agents, and engineering.</p>
    </div>

    <ul class="post-list post-list--editorial">
      {% for post in postlist %}
        {% if show_lead_post and post.url == lead_post.url %}
          {% continue %}
        {% endif %}

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
