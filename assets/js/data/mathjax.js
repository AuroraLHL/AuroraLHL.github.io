/*
 * @Author: LHL
 * @Date: 2024-07-24 09:00:51
 * @LastEditTime: 2024-07-24 14:08:26
 * @FilePath: /undefined/Users/luhongliang/Desktop/AuroraLHL.github.io/assets/js/data/mathjax.js
 */
---
layout: compress
# WARNING: Don't use '//' to comment out code, use '{% comment %}' and '{% endcomment %}' instead.
---

{%- comment -%}
  See: <https://docs.mathjax.org/en/latest/options/input/tex.html#tex-options>
{%- endcomment -%}

MathJax = {
  loader: { load: ['[tex]/physics','ui/lazy',] },
  tex: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ],
    packages: {'[+]': ['physics']},
    tags: 'ams',
    macros: {
        'e': '\\mathrm{e}',
        'RR': '\\mathbb{R}',
        'ZZ': '\\mathbb{Z}',
        'QQ': '\\mathbb{Q}',
      },
  }
  options: {
    lazyMargin: '200px',
  },
  svg: { fontCache: 'global'},
};