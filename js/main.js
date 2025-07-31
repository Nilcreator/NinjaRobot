document.addEventListener('DOMContentLoaded', () => {

    // ===== 多言語対応 =====
    // This section handles the multi-language support for the website.
    const translations = {
        'ja': {
            // Navigation & Common
            nav_brand: "NINJA<span class='text-blue-500'>ROBOT</span>",
            nav_home: "ホーム",
            nav_create: "作成",
            nav_about: "私たちについて",
            nav_community: "コミュニティ",
            nav_contact: "お問い合わせ",
            nav_blockly: "ブロック",
            nav_python: "Python",
            
            // Home Page
            home_hero_slogan: "遊びからテクノロジーへ：<br class='md:hidden'/>明日の技能を習得する。",
            home_hero_intro: "私たちは、未来の世代がテクノロジーを意図的に活用する創造的な発明家となることを支援します。",
            home_features_title: "Ninja Robotの革新的な機能",
            home_features_intro: "私たちのプラットフォームは、実社会で役立つスキルの不足、教員の専門知識不足、教育格差といった主要な教育課題に対し、アクセスしやすく魅力的な学習体験を提供することで解決を目指します。",
            home_hardware_title: "未来のイノベーターのための高度なハードウェア",
            home_hardware_item1_title: "Raspberry Pi搭載",
            home_hardware_item1_desc: "高度なAIアプリにも対応する処理能力と拡張性を提供します。",
            home_hardware_item2_title: "プラグアンドプレイ",
            home_hardware_item2_desc: "簡単な接続で、授業中のデバッグ時間を大幅に削減します。",
            home_software_title: "実社会で役立つシームレスなソフトウェア",
            home_software_item1_title: "Python & Scratch",
            home_software_item1_desc: "初心者から上級者まで、段階的に実用的なスキルを習得できます。",
            home_software_item2_title: "クラウド環境",
            home_software_item2_desc: "インストール不要で、どんなデバイスからでもアクセス可能です。",
            home_prototype_title: "最新のポロとタイプ",
            home_prototype_feet_title: "ニンジャフィート",
            home_prototype_feet_desc: "俊敏で正確な歩行者、ニンジャフィートをご紹介します。二足歩行の設計により、ニンジャフィートは複雑な動きとバランスを実証することに優れており、ヒューマノイドロボットとAIの世界へのユニークな洞察を提供します。",
            home_prototype_tire_title: "ニンジャタイヤ",
            home_prototype_tire_desc: "全地形対応の探検家、ニンジャタイヤをご紹介します。頑丈なホイールと高度なAIナビゲーションを搭載し、あらゆる環境に対応できるように設計されており、ロボット工学と力学の学習をエキサイティングな冒険にします。",
            
            // Create Page
            create_page_title: "あなたのコーディングの旅がここから始まる！",
            create_page_intro: "段階的なアプローチにより、ビジュアルコーディングからプロフェッショナルなプログラミングまで、スムーズな学習が可能です。",
            create_step1_title: "Webインターフェースに接続",
            create_step1_desc: "インストール不要。ブラウザから直接ロボットをプログラムできます。シミュレーターを使えば、ロボットがなくても学習を始められます。",
            create_step2_title: "Scratchで基礎を学ぶ",
            create_step2_desc: "初心者向けに、グラフィカルなブロックを使ってプログラミングの基本概念を楽しく、直感的に学びます。",
            create_step3_title: "Pythonへ移行",
            create_step3_desc: "学習が進んだら、AIや機械学習で使われる強力な言語Pythonで、より複雑で「賢いロボット」を構築します。",
            create_blockly_placeholder: "ブロックインターフェース",

            // About Page
            about_title: "私たちについて",
            about_fablab_intro: "私たちはFabLab Kannaiを拠点とする、テクノロジー教育に情熱を注ぐチームです。オープンソースとコミュニティの力を信じ、すべての子供たちが創造性を発揮できる未来を目指しています。",
            about_fablab_kannai_title: "ファブラボ関内について",
            about_fablab_kannai_desc: "ファブラボ関内は、関内の中心部に位置するコミュニティワークショップおよびデジタルファブリケーションラボです。3Dプリンターやレーザーカッターから電子工作台まで、幅広いツールや技術へのアクセスを提供しています。私たちの使命は、人々が学び、協力し、創造するためのスペースを提供することで、革新と創造性を育むことです。私たちは、 ニンジャロボットプロジェクトとそのSTEAM教育の推進という目標を誇りに思っています。",
            about_team_title: "Ninja Robot チームメンバー",
            about_member1_name: "メンバー 1",
            about_member1_bio: "リード開発者。ロボットと教育への情熱を持つ。",
            about_member2_name: "メンバー 2",
            about_member2_bio: "カリキュラムデザイナー。楽しく学べる教材を作成。",
            about_member3_name: "メンバー 3",
            about_member3_bio: "コミュニティマネージャー。イベントやワークショップを企画。",
            about_member4_name: "メンバー 4",
            about_member4_bio: "ハードウェアエンジニア。ロボットの設計と製作を担当。",

            // Community Page
            community_page_title: "活気あるグローバルコミュニティに参加しよう！",
            community_page_intro: "仲間や教育者、メーカーとつながり、共に成長しましょう。",
            community_inspired_title: "偉大な先駆者たちからインスピレーションを受けて",
            community_inspired_desc: "私たちのプラットフォームは、オープンソースの精神と商用製品の信頼性を融合させています。",
            community_inspired_item1: "100万人以上のビルダーを誇るオープンソースロボット<b>OttoDIY</b>の豊かな遺産の上に築かれています。",
            community_inspired_item2: "信頼性の高い学習体験で知られる<b>HPRobot</b>からもインスピレーションを得ています。",
            community_connect_title: "共に学び、成長する",
            community_connect_desc: "強力なオンライン共同コミュニティとオープンソースサポートを通じて、イノベーションを奨励します。",
            community_connect_item1: "生徒はプロジェクトを共有し、教育者は専門知識を交換できます。",
            community_connect_item2: "ユーザーがロボットをリミックス・改造することを可能にし、創造性を促進します。",
            community_connect_item3: "成功した教育プログラムから教訓を得て、質の高い学習体験を提供します。",

            // Contact Page
            contact_title: "お問い合わせ",
            contact_form_name: "氏名",
            contact_form_email: "メールアドレス",
            contact_form_subject: "件名",
            contact_form_message: "メッセージ",
            contact_form_submit: "送信",
            contact_error_required: "このフィールドは必須です。",
            contact_error_email: "有効なメールアドレスを入力してください。",
            contact_form_success: "メッセージが送信されました。ありがとうございます！",

            // Chat
            chat_title: "AIアシスタント",
            chat_greeting: "こんにちは！何かお手伝いできることはありますか？",
            chat_placeholder: "メッセージを入力...",
            chat_send: "送信",

            // Footer
            footer_copyright: "© 2025 Ninja Robot. 無断複写・転載を禁じます。"
        },
        'en': {
            // Navigation & Common
            nav_brand: "NINJA<span class='text-blue-500'>ROBOT</span>",
            nav_home: "Home",
            nav_create: "Create",
            nav_about: "About Us",
            nav_community: "Community",
            nav_contact: "Contact Us",
            nav_blockly: "Blocks",
            nav_python: "Python",

            // Home Page
            home_hero_slogan: "From Play to Purpose: <br class='md:hidden'/>Mastering Tomorrow's Tech.",
            home_hero_intro: "We empower the next generation to become creative inventors who purposefully use technology.",
            home_features_title: "Ninja Robot's Innovative Features",
            home_features_intro: "Our platform addresses key challenges in education, such as the lack of practical skills, limited teacher expertise, and educational disparities, by providing an accessible and engaging learning experience.",
            home_hardware_title: "Advanced Hardware for Future Innovators",
            home_hardware_item1_title: "Powered by Raspberry Pi",
            home_hardware_item1_desc: "Offers robust processing power and expandability for advanced AI applications.",
            home_hardware_item2_title: "Plug-and-Play",
            home_hardware_item2_desc: "Easy connection significantly reduces debugging time in class.",
            home_software_title: "Seamless Software for Real-World Skills",
            home_software_item1_title: "Python & Scratch",
            home_software_item1_desc: "Acquire practical skills progressively, from beginner to advanced levels.",
            home_software_item2_title: "Cloud Environment",
            home_software_item2_desc: "No installation required, providing access from anywhere on any device.",
            home_prototype_title: "Latest Prototype",
            home_prototype_feet_title: "Ninja Feet",
            home_prototype_feet_desc: "Introducing the agile and precise walker, Ninja Feet. With its bipedal design, Ninja Feet excels at demonstrating complex movements and balance, offering a unique insight into the world of humanoid robotics and AI.",
            home_prototype_tire_title: "Ninja Tire",
            home_prototype_tire_desc: "Introducing the all-terrain explorer, Ninja Tire. Equipped with rugged wheels and advanced AI navigation, it is designed to handle any environment, making learning about robotics and mechanics an exciting adventure.",
            
            // Create Page
            create_page_title: "Your Coding Journey Starts Here!",
            create_page_intro: "Our step-by-step approach ensures a smooth learning curve from visual coding to professional-grade programming.",
            create_step1_title: "Connect to the Web Interface",
            create_step1_desc: "No installation needed. Program your robot directly from the browser. You can start learning even without a robot using the simulator.",
            create_step2_title: "Learn the Basics with Scratch",
            create_step2_desc: "For beginners, use graphical blocks to learn fundamental programming concepts in a fun and intuitive way.",
            create_step3_title: "Transition to Python",
            create_step3_desc: "As you progress, build more complex and 'smarter robots' with Python, a powerful language used in AI and machine learning.",
            create_blockly_placeholder: "Block Interface",

            // About Page
            about_title: "About Us",
            about_fablab_intro: "We are a team based at FabLab Kannai, passionate about technology education. We believe in the power of open source and community to create a future where all children can unleash their creativity.",
            about_fablab_kannai_title: "About FabLab Kannai",
            about_fablab_kannai_desc: "FabLab Kannai is a community workshop and digital fabrication lab located in the heart of Kannai. We offer access to a wide range of tools and technologies, from 3D printers and laser cutters to electronics workbenches. Our mission is to foster innovation and creativity by providing a space for people to learn, collaborate, and create. We are proud to support the Ninja Robot project and its goal of promoting STEAM education.",
            about_team_title: "Ninja Robot Team Members",
            about_member1_name: "Member 1",
            about_member1_bio: "Lead Developer. Passionate about robotics and education.",
            about_member2_name: "Member 2",
            about_member2_bio: "Curriculum Designer. Creates fun and engaging learning materials.",
            about_member3_name: "Member 3",
            about_member3_bio: "Community Manager. Organizes events and workshops.",
            about_member4_name: "Member 4",
            about_member4_bio: "Hardware Engineer. Designs and builds the robots.",

            // Community Page
            community_page_title: "Join our vibrant global community!",
            community_page_intro: "Connect with fellow builders, educators, and makers to grow together.",
            community_inspired_title: "Inspired by Great Pioneers",
            community_inspired_desc: "Our platform merges the spirit of open source with the reliability of commercial products.",
            community_inspired_item1: "Built on the rich legacy of <b>OttoDIY</b>, an open-source robot with a community of over a million builders.",
            community_inspired_item2: "Also inspired by <b>HPRobot</b>, known for its reliable 'plug-and-play' learning experience.",
            community_connect_title: "Learn and Grow Together",
            community_connect_desc: "We encourage innovation through a strong online collaborative community and open-source support.",
            community_connect_item1: "Students can share projects, and educators can exchange expertise.",
            community_connect_item2: "Allows users to remix and modify their robots, fostering creativity.",
            community_connect_item3: "Provides a quality learning experience by drawing lessons from successful educational programs.",

            // Contact Page
            contact_title: "Contact Us",
            contact_form_name: "Name",
            contact_form_email: "Email Address",
            contact_form_subject: "Subject",
            contact_form_message: "Message",
            contact_form_submit: "Submit",
            contact_error_required: "This field is required.",
            contact_error_email: "Please enter a valid email address.",
            contact_form_success: "Message sent successfully. Thank you!",

            // Chat
            chat_title: "AI Assistant",
            chat_greeting: "Hello! How can I help you today?",
            chat_placeholder: "Type a message...",
            chat_send: "Send",

            // Footer
            footer_copyright: "&copy; 2025 Ninja Robot. All Rights Reserved."
        },
        'zh-TW': {
            // Navigation & Common
            nav_brand: "NINJA<span class='text-blue-500'>ROBOT</span>",
            nav_home: "首頁",
            nav_create: "創建",
            nav_about: "關於我們",
            nav_community: "社群",
            nav_contact: "聯繫我們",
            nav_blockly: "積木",
            nav_python: "Python",
            
            // Home Page
            home_hero_slogan: "從玩樂到科技：<br class='md:hidden'/>掌握未來技能。",
            home_hero_intro: "我們致力於幫助下一代成為有目的地使用技術的創造性發明家。",
            home_features_title: "忍者機器人的創新功能",
            home_features_intro: "我們的平台透過提供易於使用且引人入勝的學習體驗，解決了教育中的關鍵挑戰，例如實用技能的缺乏、教師專業知識的局限性以及教育差距。",
            home_hardware_title: "為未來創新者打造的先進硬體",
            home_hardware_item1_title: "由樹莓派驅動",
            home_hardware_item1_desc: "為先進的AI應用提供強大的處理能力和擴展性。",
            home_hardware_item2_title: "即插即用",
            home_hardware_item2_desc: "簡單的連接方式，大大減少了課堂上的除錯時間。",
            home_software_title: "無縫軟體，掌握實用技能",
            home_software_item1_title: "Python & Scratch",
            home_software_item1_desc: "從初學者到進階者，逐步掌握實用技能。",
            home_software_item2_title: "雲端環境",
            home_software_item2_desc: "無需安裝，可隨時隨地在任何設備上使用。",
            home_prototype_title: "最新的原型",
            home_prototype_feet_title: "忍者腳",
            home_prototype_feet_desc: "介紹敏捷而精確的步行者，忍者腳。憑藉其雙足設計，忍者腳擅長展示複雜的動作和平衡，為人形機器人和AI的世界提供了獨特的見解。",
            home_prototype_tire_title: "忍者輪胎",
            home_prototype_tire_desc: "介紹全地形探險家，忍者輪胎。配備堅固的輪子和先進的AI導航，旨在應對任何環境，使學習機器人技術和力學成為一場激動人心的冒險。",
            
            // Create Page
            create_page_title: "您的編碼之旅從這裡開始！",
            create_page_intro: "我們的分步方法確保了從視覺化編碼到專業級編程的平穩學習曲線。",
            create_step1_title: "連接到Web界面",
            create_step1_desc: "無需安裝。直接從瀏覽器對您的機器人進行編程。您甚至可以在沒有機器人的情況下使用模擬器開始學習。",
            create_step2_title: "使用Scratch學習基礎知識",
            create_step2_desc: "對於初學者，使用圖形塊以有趣和直觀的方式學習基本的編程概念。",
            create_step3_title: "過渡到Python",
            create_step3_desc: "隨著您的進步，使用Python（一種用於AI和機器學習的強大語言）構建更複雜、更「聰明」的機器人。",
            create_blockly_placeholder: "塊接口",

            // About Page
            about_title: "關於我們",
            about_fablab_intro: "我們是一支位於FabLab Kannai的團隊，對技術教育充滿熱情。我們相信開源和社區的力量，可以創造一個所有孩子都能發揮創造力的未來。",
            about_fablab_kannai_title: "關於 FabLab 關內",
            about_fablab_kannai_desc: "FabLab 關內是位於關內市中心的社區工場和數位製造實驗室。我們提供各種工具和技術的接觸機會，從 3D 列印機和雷射切割機到電子工作台。我們的使命是透過提供一個讓人們學習、合作和創造的空間來培養創新和創造力。我們很自豪能夠支持忍者機器人專案及其推廣 STEAM 教育的目標。",
            about_team_title: "忍者機器人團隊成員",
            about_member1_name: "成員1",
            about_member1_bio: "首席開發人員。對機器人技術和教育充滿熱情。",
            about_member2_name: "成員2",
            about_member2_bio: "課程設計師。創造有趣且引人入勝的學習材料。",
            about_member3_name: "成員3",
            about_member3_bio: "社區經理。組織活動和研討會。",
            about_member4_name: "成員4",
            about_member4_bio: "硬體工程師。設計和製造機器人。",

            // Community Page
            community_page_title: "加入我們充滿活力的全球社區！",
            community_page_intro: "與其他建設者、教育工作者和創客聯繫，共同成長。",
            community_inspired_title: "受到偉大先驅的啟發",
            community_inspired_desc: "我們的平台融合了開源精神和商業產品的可靠性。",
            community_inspired_item1: "建立在擁有超過一百萬建設者社區的開源機器人<b>OttoDIY</b>的豐富遺產之上。",
            community_inspired_item2: "也受到以其可靠的「即插即用」學習體驗而聞名的<b>HPRobot</b>的啟發。",
            community_connect_title: "共同學習和成長",
            community_connect_desc: "我們通過強大的在線協作社區和開源支持來鼓勵創新。",
            community_connect_item1: "學生可以分享項目，教育工作者可以交流專業知識。",
            community_connect_item2: "允許用戶重新混合和修改他們的機器人，從而培養創造力。",
            community_connect_item3: "通過借鑒成功的教育計劃的經驗，提供優質的學習體驗。",

            // Contact Page
            contact_title: "聯繫我們",
            contact_form_name: "姓名",
            contact_form_email: "電子郵件地址",
            contact_form_subject: "主旨",
            contact_form_message: "訊息",
            contact_form_submit: "提交",
            contact_error_required: "此欄位為必填項。",
            contact_error_email: "請輸入有效的電子郵件地址。",
            contact_form_success: "訊息已成功發送。謝謝！",

            // Chat
            chat_title: "AI助理",
            chat_greeting: "您好！我今天能為您做些什麼？",
            chat_placeholder: "輸入訊息...",
            chat_send: "發送",

            // Footer
            footer_copyright: "© 2025 Ninja Robot. 版權所有。"
        }
    };

    const langSwitcherBtn = document.getElementById('lang-switcher-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    const currentLangText = document.getElementById('current-lang-text');

    langSwitcherBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        langDropdown.classList.add('hidden');
    });

    function setLanguage(lang) {
        document.documentElement.lang = lang;
        const langMap = { 'ja': '日本語', 'en': 'English', 'zh-TW': '繁體中文' };
        currentLangText.textContent = langMap[lang];
        
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (translations[lang] && translations[lang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translations[lang][key];
                } else {
                    el.innerHTML = translations[lang][key];
                }
            }
        });
        langDropdown.classList.add('hidden');
    }

    langDropdown.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            setLanguage(lang);
        }
    });

    // ===== 作成ページのタブ機能 =====
    // This section handles the tab functionality on the create page.
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabBtns.length > 0 && tabContents.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                tabBtns.forEach(b => b.classList.remove('active', '!border-blue-500'));
                btn.classList.add('active', '!border-blue-500');
                tabContents.forEach(content => {
                    content.classList.toggle('hidden', content.id !== `${tabId}-content`);
                    content.classList.toggle('active', content.id === `${tabId}-content`);
                });
            });
        });
    }

    // ===== AIチャットモーダル機能 =====
    // This section handles the AI chat modal functionality.
    const aiFab = document.getElementById('ai-fab');
    const aiChatModal = document.getElementById('ai-chat-modal');
    const closeChatBtn = document.getElementById('close-chat-btn');

    if (aiFab && aiChatModal && closeChatBtn) {
        aiFab.addEventListener('click', () => {
            aiChatModal.classList.remove('hidden');
            aiChatModal.classList.add('flex');
        });

        closeChatBtn.addEventListener('click', () => {
            aiChatModal.classList.add('hidden');
            aiChatModal.classList.remove('flex');
        });

        aiChatModal.addEventListener('click', (e) => {
            if (e.target === aiChatModal) {
                aiChatModal.classList.add('hidden');
                aiChatModal.classList.remove('flex');
            }
        });
    }

    // ===== お問い合わせフォームのバリデーション =====
    // This section handles the contact form validation.
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            const emailRegex = /^[^\s@]+@[\s@]+\.[^\s@]+$/;

            const currentLang = document.documentElement.lang || 'ja';
            const errorTitle = translations[currentLang]['error_popup_title'];
            const allFieldsRequired = translations[currentLang]['error_all_fields_required'];
            const invalidEmail = translations[currentLang]['error_invalid_email'];

            if (!name || !email || !subject || !message) {
                showErrorPopup(errorTitle, allFieldsRequired);
                return;
            }

            if (!emailRegex.test(email)) {
                showErrorPopup(errorTitle, invalidEmail);
                return;
            }

            contactForm.submit();
        });
    }

    const errorModal = document.getElementById('error-modal');
    const closeErrorBtn = document.getElementById('close-error-btn');
    const errorModalMessage = document.getElementById('error-modal-message');

    if (errorModal && closeErrorBtn && errorModalMessage) {
        closeErrorBtn.addEventListener('click', () => {
            errorModal.classList.add('hidden');
        });

        errorModal.addEventListener('click', (e) => {
            if (e.target === errorModal) {
                errorModal.classList.add('hidden');
            }
        });
    }

    function showErrorPopup(title, message) {
        const errorPopupTitle = document.querySelector('#error-modal h3');
        if (errorPopupTitle) {
            errorPopupTitle.textContent = title;
        }
        errorModalMessage.textContent = message;
        errorModal.classList.remove('hidden');
        errorModal.classList.add('flex');
    }

    // ===== モバイルメニュー =====
    // This section handles the mobile menu functionality.
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
    
    // ===== 背景アニメーション =====
    // This section handles the background animation.
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = `rgba(0, 112, 243, ${Math.random() * 0.2 + 0.05})`;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const numberOfParticles = canvas.width / 80;
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    // ===== 初期化処理 =====
    // This section initializes the website.
    function initialize() {
        setLanguage('ja');
        resizeCanvas();
        initParticles();
        animateParticles();
    }
    
    initialize();
});
