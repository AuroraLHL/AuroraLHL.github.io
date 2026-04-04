// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "post-a-deep-dive-into-openclaw",
        
          title: "A Deep Dive into OpenClaw",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/openclaw-deep-research/";
          
        },
      },{id: "post-belman-equation",
        
          title: 'Belman Equation <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://zhuanlan.zhihu.com/p/688029400", "_blank");
          
        },
      },{id: "post-scaling-law",
        
          title: "Scaling Law",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/scaling-law/";
          
        },
      },{id: "post-transformer-architecture-explained-attention-is-all-you-need",
        
          title: "Transformer Architecture Explained: Attention is All You Need",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/transformer/";
          
        },
      },{id: "post-understanding-attention-mechanism-self-attention-and-attention-models",
        
          title: "Understanding Attention Mechanism: Self-Attention and Attention Models",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/attention-mechanism/";
          
        },
      },{id: "post-nlp-fundamentals-rnn-seq2seq-and-attention-mechanism-basics",
        
          title: "NLP Fundamentals: RNN, Seq2Seq and Attention Mechanism Basics",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/nlp-fundamentals/";
          
        },
      },{id: "post-introduction-to-machine-learning",
        
          title: "Introduction to Machine Learning",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/ML1/";
          
        },
      },{id: "post-building-personal-website-with-github-pages",
        
          title: "Building Personal Website with GitHub Pages",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/Githubpages_tutorial/";
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-our-paper-optmath-a-scalable-bidirectional-data-synthesis-framework-for-optimization-modeling-has-been-accepted-as-a-poster-presentation-at-icml-2025",
          title: 'Our paper “OptMATH: A Scalable Bidirectional Data Synthesis Framework for Optimization Modeling” has...',
          description: "",
          section: "News",},{id: "news-we-are-excited-to-release-our-latest-research-work-in-agentic-rl-search-self-play-pushing-the-frontier-of-agent-capability-without-supervision-the-paper-has-been-submitted-to-iclr-2026-and-explores-novel-self-play-training-methods-for-enhancing-agent-capabilities-without-supervision",
          title: 'We are excited to release our latest research work in Agentic RL: “Search...',
          description: "",
          section: "News",},{id: "news-our-paper-search-self-play-pushing-the-frontier-of-agent-capability-without-supervision-has-been-accepted-to-iclr-2026",
          title: 'Our paper “Search Self-Play: Pushing the Frontier of Agent Capability without Supervision” has...',
          description: "",
          section: "News",},{id: "projects-optmath",
          title: 'OptMATH',
          description: "🚀 A Scalable Bidirectional Data Synthesis Framework for Optimization Modeling - Revolutionizing LLM capabilities in mathematical optimization",
          section: "Projects",handler: () => {
              window.location.href = "/projects/optmath/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6C%68%6C@%70%6B%75.%65%64%75.%63%6E", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/AuroraLHL", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0009-0003-3319-2512", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=ri-c_10AAAAJ", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
