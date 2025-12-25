document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DỮ LIỆU BÀI VIẾT (DATABASE GIẢ LẬP) ---
    const blogPosts = [
        {
            id: 'thu-choi',
            title: 'Case Study: Thử chơi',
            date: '12/05/2025',
            excerpt: 'Bài viết test thử nghiệm hệ thống blog markdown static.',
            file: './posts/thuchoi.md'
        },
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

    // --- 2. XÁC ĐỊNH TRANG HIỆN TẠI VÀ CHẠY LOGIC TƯƠNG ỨNG ---
    
    const homeBlogList = document.getElementById('home-blog-list');
    const allBlogList = document.getElementById('all-blog-list');
    const postDetailContainer = document.getElementById('post-detail-container');

    // Case 1: Trang Chủ (Chỉ hiện 3 bài mới nhất)
    if (homeBlogList) {
        renderBlogList(blogPosts.slice(0, 3), homeBlogList);
    }

    // Case 2: Trang Blog (Hiện tất cả bài)
    if (allBlogList) {
        renderBlogList(blogPosts, allBlogList);
    }

    // Case 3: Trang Chi Tiết Bài Viết (Render nội dung Markdown)
    if (postDetailContainer) {
        // Lắng nghe sự kiện hashchange để cập nhật nội dung khi người dùng ấn Back/Forward
        window.addEventListener('hashchange', () => renderPostDetail(postDetailContainer));
        
        // Render lần đầu tiên
        renderPostDetail(postDetailContainer);
    }

    // --- 3. CÁC HÀM HỖ TRỢ (HELPER FUNCTIONS) ---

    // Hàm render danh sách bài viết ra HTML
    function renderBlogList(posts, container) {
        container.innerHTML = '';
        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'card blog-card';
            // UPDATE: Sử dụng Hash (#) thay vì Query Param (?)
            card.onclick = () => {
                window.location.href = `post.html#${post.id}`;
            };
            
            card.innerHTML = `
                <div class="blog-date">${post.date}</div>
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-excerpt">${post.excerpt}</p>
                <span class="read-more-btn">Đọc chi tiết →</span>
            `;
            container.appendChild(card);
        });
    }

    // Hàm xử lý trang chi tiết bài viết
    async function renderPostDetail(container) {
        // UPDATE: Lấy ID từ Hash URL (loại bỏ dấu # ở đầu)
        // Ví dụ: post.html#von-dieu-le -> postId = von-dieu-le
        const postId = window.location.hash.substring(1);

        if (!postId) {
             container.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <p>Vui lòng chọn một bài viết để xem.</p>
                    <a href="blog.html" class="btn btn-primary" style="margin-top:20px;">Xem danh sách tin tức</a>
                </div>
            `;
            return;
        }

        // Tìm bài viết trong dữ liệu
        const post = blogPosts.find(p => p.id === postId);

        if (!post) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2>🚫 Không tìm thấy bài viết</h2>
                    <p>Bài viết bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
                    <a href="blog.html" class="btn btn-primary" style="margin-top:20px;">Quay lại danh sách</a>
                </div>
            `;
            return;
        }

        // Cập nhật tiêu đề trang web
        document.title = `${post.title} | Kế Toán Diệu Tâm`;

        // Hiển thị trạng thái đang tải
        container.innerHTML = '<p style="text-align:center; padding: 50px;">⏳ Đang tải nội dung bài viết...</p>';

        try {
            const response = await fetch(post.file);
            if (!response.ok) throw new Error('Lỗi tải file');
            const text = await response.text();
            
            // Parse Markdown và hiển thị
            const htmlContent = parseMarkdown(text);
            
            container.innerHTML = `
                <div class="post-header">
                    <span class="post-date">${post.date}</span>
                    <h1 class="post-heading">${post.title}</h1>
                    <div class="divider" style="margin: 20px 0;"></div>
                </div>
                <div class="post-content">
                    ${htmlContent}
                </div>
                <div class="post-footer">
                    <a href="blog.html" class="btn btn-outline" style="color:var(--primary-color); border-color:var(--primary-color);">← Quay lại danh sách tin tức</a>
                </div>
            `;
            
            // Scroll lên đầu trang khi load xong bài viết mới
            window.scrollTo(0, 0);

        } catch (error) {
            container.innerHTML = `<p style="color:red; text-align:center;">Lỗi: Không thể tải nội dung bài viết. (${error.message})</p>`;
        }
    }

    // Hàm parse Markdown (Giữ nguyên)
    function parseMarkdown(markdown) {
        let html = markdown;
        html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
        html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
        html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/__(.*)__/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
        html = html.replace(/_(.*)_/gim, '<em>$1</em>');
        html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
        html = html.replace(/^\s*[\-\*] (.*$)/gim, '<li>$1</li>');
        html = html.replace(/\n\n/gim, '</p><p>');
        html = '<p>' + html + '</p>';
        html = html.replace(/<p><\/p>/gim, '');
        // Xử lý bảng (Table) cơ bản cho Markdown
        html = html.replace(/\|(.+)\|/g, (match) => {
            const cells = match.split('|').filter(c => c.trim() !== '');
            return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
        });
        if (html.includes('<tr>')) {
             html = html.replace(/((<tr>.*<\/tr>)\s*)+/g, '<table class="md-table"><tbody>$&</tbody></table>');
        }

        return html;
    }

    // --- 4. LOGIC CHUNG CHO UI (MENU, SCROLL) ---
    const hamburger = document.getElementById('hamburger');
    const navList = document.querySelector('.nav-list');
    
    if (hamburger && navList) {
        hamburger.addEventListener('click', () => {
            navList.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = "0 5px 20px rgba(0,0,0,0.1)";
                header.style.height = "60px";
            } else {
                header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
                header.style.height = "70px";
            }
        });
    }
});