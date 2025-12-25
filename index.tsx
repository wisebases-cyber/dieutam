document.addEventListener('DOMContentLoaded', () => {
    
    // --- CẤU HÌNH DANH SÁCH BÀI VIẾT BLOG ---
    // Vì đây là web tĩnh, bạn cần khai báo tên file ở đây.
    // Hãy tạo thư mục 'posts' cùng cấp với file index.html và đặt các file .md vào đó.
    const blogPosts = [
        {
            id: 'thong-tu-99',
            title: 'Hướng dẫn Thông tư 99/2025/TT-BTC mới nhất',
            date: '10/05/2025',
            excerpt: 'Những điểm mới về thuế GTGT và TNDN áp dụng cho năm tài chính 2026 mà doanh nghiệp cần lưu ý.',
            file: './posts/bai-viet-1.md'
        },
        {
            id: 'von-dieu-le',
            title: 'Phân biệt Vốn Điều Lệ & Vốn Pháp Định',
            date: '08/05/2025',
            excerpt: 'Rủi ro pháp lý khi kê khai sai vốn. Hướng dẫn các thủ tục tăng/giảm vốn điều lệ đúng luật.',
            file: './posts/bai-viet-2.md'
        },
        {
            id: 'case-study-fdi',
            title: 'Case Study: Giải quyết khủng hoảng thuế cho DN FDI',
            date: '01/05/2025',
            excerpt: 'Câu chuyện thực tế về cách Diệu Tâm hỗ trợ một doanh nghiệp Nhật Bản hoàn thuế 20 tỷ đồng.',
            file: './posts/bai-viet-3.md'
        }
    ];

    // --- 1. RENDER LIST BÀI VIẾT ---
    const blogListContainer = document.getElementById('blog-list');
    
    if (blogListContainer) {
        blogListContainer.innerHTML = ''; // Xóa placeholder
        
        blogPosts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'card blog-card';
            card.innerHTML = `
                <div class="blog-date">${post.date}</div>
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-excerpt">${post.excerpt}</p>
                <span class="read-more-btn">Đọc tiếp →</span>
            `;
            
            // Sự kiện click để mở bài viết
            card.addEventListener('click', () => openBlogPost(post));
            blogListContainer.appendChild(card);
        });
    }

    // --- 2. LOGIC MODAL & FETCH MARKDOWN ---
    const modal = document.getElementById('blog-modal');
    const modalTitle = modal?.querySelector('.modal-title');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = modal?.querySelector('.close-modal');

    // Hàm đóng modal
    const closeModal = () => {
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = ''; // Cho phép cuộn lại
        }
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Hàm mở bài viết
    async function openBlogPost(post) {
        if (!modal || !modalContent || !modalTitle) return;

        // Hiển thị modal và loader
        modalTitle.textContent = post.title;
        modalContent.innerHTML = '<p style="text-align:center; padding: 20px;">⏳ Đang tải nội dung...</p>';
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Khóa cuộn trang chính

        try {
            const response = await fetch(post.file);
            
            if (!response.ok) {
                throw new Error(`Không thể tải file (Lỗi ${response.status})`);
            }

            const text = await response.text();
            
            // Chuyển đổi Markdown sang HTML (Simple Parser)
            const htmlContent = parseMarkdown(text);
            modalContent.innerHTML = htmlContent;

        } catch (error) {
            console.error(error);
            modalContent.innerHTML = `
                <div style="color: red; text-align: center;">
                    <h3>Không thể tải bài viết</h3>
                    <p>Vui lòng kiểm tra xem file <b>${post.file}</b> có tồn tại trong thư mục <b>posts/</b> không.</p>
                    <p><i>Lưu ý: Nếu bạn mở trực tiếp file HTML, trình duyệt có thể chặn tải file ngoài. Hãy thử dùng VSCode Live Server.</i></p>
                </div>
            `;
        }
    }

    // --- 3. SIMPLE MARKDOWN PARSER (Không cần thư viện ngoài) ---
    function parseMarkdown(markdown) {
        let html = markdown;

        // 1. Headers (### -> h3, ## -> h2, # -> h1)
        // Lưu ý: Replace từ h6 đến h1 để tránh lỗi trùng lặp
        html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
        html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
        html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // 2. Bold (**text**)
        html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/__(.*)__/gim, '<strong>$1</strong>');

        // 3. Italic (*text*)
        html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
        html = html.replace(/_(.*)_/gim, '<em>$1</em>');

        // 4. Blockquote (> text)
        html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

        // 5. Unordered List (- item)
        // Bước này hơi phức tạp với Regex đơn giản, ta làm cơ bản:
        // Chuyển các dòng bắt đầu bằng - hoặc * thành <li>
        html = html.replace(/^\s*[\-\*] (.*$)/gim, '<li>$1</li>');
        // Bao quanh các <li> liên tiếp bằng <ul> (Cách đơn giản hóa)
        // Để đơn giản cho parser thủ công, ta chỉ chuyển dòng thành li, CSS sẽ xử lý hiển thị
        
        // 6. Line breaks (Đổi xuống dòng thành <br> hoặc thẻ P)
        // Tách các đoạn văn bằng 2 lần xuống dòng
        html = html.replace(/\n\n/gim, '</p><p>');
        // Bao toàn bộ trong thẻ p nếu chưa có
        html = '<p>' + html + '</p>';
        
        // Dọn dẹp các thẻ p rỗng do regex tạo ra
        html = html.replace(/<p><\/p>/gim, '');

        return html;
    }

    // --- CÁC LOGIC CŨ (Mobile Menu, Scroll...) ---
    const hamburger = document.getElementById('hamburger');
    const navList = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navList) {
        hamburger.addEventListener('click', () => {
            navList.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = "0 5px 20px rgba(0,0,0,0.1)";
                header.style.padding = "0";
                header.style.height = "60px";
            } else {
                header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
                header.style.padding = "0";
                header.style.height = "70px";
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
});