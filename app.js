/**
 * -------------------------------------------------------------
 * NizeTik - Trình Tải Video TikTok Trực Tiếp Không Logo
 * Phát triển bởi: Nguyễn Tiêu (v1.5 Separated Edition)
 * -------------------------------------------------------------
 */

// =============================================================
// I. HỆ THỐNG BẢO MẬT CHẶN XEM/LẤY SOURCE CODE (MOBILE & PC)
// =============================================================

const securityModal = document.getElementById('securityModal');

function triggerSecurityAlert() {
    if (securityModal) {
        securityModal.classList.remove('hidden');
    }
}

function closeSecurityModal() {
    if (securityModal) {
        securityModal.classList.add('hidden');
    }
}

// 1. Chặn chuột phải trên máy tính
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    triggerSecurityAlert();
});

// 2. Chặn đè giữ đa ngón trên điện thoại di động
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 2) {
        e.preventDefault();
        triggerSecurityAlert();
    }
}, { passive: false });

// 3. Chặn các phím tắt hệ thống (F12, Inspect, View-Source, Save)
document.addEventListener('keydown', (e) => {
    // Chặn F12
    if (e.keyCode === 123) {
        e.preventDefault();
        triggerSecurityAlert();
        return false;
    }
    // Chặn Ctrl + Shift + I / J / C (Windows)
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        triggerSecurityAlert();
        return false;
    }
    // Chặn Cmd + Alt + I / J / C (Mac)
    if (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        triggerSecurityAlert();
        return false;
    }
    // Chặn Ctrl + U / Cmd + U (View Source)
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
        e.preventDefault();
        triggerSecurityAlert();
        return false;
    }
    // Chặn Ctrl + S / Cmd + S (Save Page)
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
        e.preventDefault();
        triggerSecurityAlert();
        return false;
    }
    // Chặn Ctrl + P / Cmd + P (Print Page)
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 80) {
        e.preventDefault();
        triggerSecurityAlert();
        return false;
    }
});

// 4. Chặn kéo thả hình ảnh/video
document.addEventListener('dragstart', (e) => {
    e.preventDefault();
});

// 5. Chặn sao chép (Copy) văn bản, thông tin trên trang
document.addEventListener('copy', (e) => {
    e.preventDefault();
    showToast("⚠️ Mã nguồn và dữ liệu đã được bảo vệ!");
});

// =============================================================
// II. XỬ LÝ LOGIC GIAO DIỆN & TẢI VIDEO TIKTOK
// =============================================================

const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const tiktokUrlInput = document.getElementById('tiktokUrl');
const charCount = document.getElementById('charCount');
const pasteBtn = document.getElementById('pasteBtn');
const downloadBtn = document.getElementById('downloadBtn');

const loadingSection = document.getElementById('loadingSection');
const loadingText = document.getElementById('loadingText');
const loadingBar = document.getElementById('loadingBar');
const progressPercent = document.getElementById('progressPercent');

const errorSection = document.getElementById('errorSection');
const errorMsg = document.getElementById('errorMsg');
const resultSection = document.getElementById('resultSection');
const clearBtn = document.getElementById('clearBtn');

const videoPreview = document.getElementById('videoPreview');
const videoPlaceholder = document.getElementById('videoPlaceholder');
const authorAvatar = document.getElementById('authorAvatar');
const authorName = document.getElementById('authorName');
const authorUsername = document.getElementById('authorUsername');
const videoDesc = document.getElementById('videoDesc');

const dlNoWatermark = document.getElementById('dlNoWatermark');
const dlNoWatermarkHD = document.getElementById('dlNoWatermarkHD');
const dlAudio = document.getElementById('dlAudio');

// Biến lưu trữ link tạm thời
let extractedLinks = {
    video: '',
    hdVideo: '',
    audio: ''
};

// Toggle Menu Bar
function toggleMenu() {
    const isOpened = !sideMenu.classList.contains('translate-x-full');
    if (isOpened) {
        sideMenu.classList.add('translate-x-full');
        menuOverlay.classList.add('hidden');
        menuOverlay.classList.remove('opacity-100');
    } else {
        sideMenu.classList.remove('translate-x-full');
        menuOverlay.classList.remove('hidden');
        setTimeout(() => menuOverlay.classList.add('opacity-100'), 10);
    }
}

if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

// Popups Modal Controls
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        sideMenu.classList.add('translate-x-full');
        menuOverlay.classList.add('hidden');
        menuOverlay.classList.remove('opacity-100');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

// Gắn sự kiện đóng modal khi nhấn ra ngoài nền tối
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        e.target.parentElement.classList.add('hidden');
    });
});

// Toast Notifications
function showToast(msg) {
    const toast = document.getElementById('toastBox');
    const toastMsg = document.getElementById('toastMsg');
    if (toast && toastMsg) {
        toastMsg.textContent = msg;
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 4000);
    }
}

// Error Alerts
function alertMessage(msg) {
    if (errorMsg && errorSection) {
        errorMsg.textContent = msg;
        errorSection.classList.remove('hidden');
        errorSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Update Download Progress Bar
function updateProgress(percent, label = "") {
    if (loadingText) {
        if (label) loadingText.textContent = label;
        loadingBar.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
    }
}

// Input character counter
if (tiktokUrlInput) {
    tiktokUrlInput.addEventListener('input', (e) => {
        const val = e.target.value;
        charCount.textContent = `${val.length} ký tự`;
        errorSection.classList.add('hidden');
    });
}

// Paste link from clipboard
if (pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                tiktokUrlInput.value = text;
                charCount.textContent = `${text.length} ký tự`;
                tiktokUrlInput.dispatchEvent(new Event('input'));
            } else {
                alertMessage("Trình duyệt chặn quyền truy cập Clipboard. Hãy tự động nhấn giữ màn hình để dán.");
            }
        } catch (err) {
            alertMessage("Vui lòng thực hiện phím tắt dán thủ công.");
        }
    });
}

// CORE: TẢI TRỰC TIẾP FILE (BLOB STREAM)
async function triggerDirectDownload(fileUrl, filename) {
    updateProgress(0, "Kết nối luồng tải...");
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Truy cập tệp thất bại");
        
        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length') || 0;
        
        let receivedLength = 0;
        let chunks = [];
        
        while(true) {
            const {done, value} = await reader.read();
            if (done) break;
            
            chunks.push(value);
            receivedLength += value.length;
            
            if (contentLength) {
                const percent = Math.round((receivedLength / contentLength) * 100);
                updateProgress(percent, `Đang truyền dữ liệu file về máy: ${percent}%`);
            } else {
                updateProgress(50, "Đang nhận dữ liệu stream...");
            }
        }
        
        updateProgress(100, "Xác minh luồng tệp tin!");
        
        const blob = new Blob(chunks, { type: filename.endsWith('.mp3') ? 'audio/mp3' : 'video/mp4' });
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        showToast("Đã lưu tệp xuống thiết bị thành công!");
        
    } catch (err) {
        console.warn("CORS restriction, falling back to window blank native redirect", err);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.target = '_blank';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("Yêu cầu đã được đẩy về trình duyệt.");
    }
}

// Bắt đầu phân tích & Tự động tải video ngay sau khi click
if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
        const inputUrl = tiktokUrlInput.value.trim();
        if (!inputUrl) {
            alertMessage("Hãy dán link video TikTok trước khi bóc tách.");
            return;
        }

        if (!inputUrl.includes("tiktok.com")) {
            alertMessage("Liên kết TikTok không đúng định dạng.");
            return;
        }

        loadingSection.classList.remove('hidden');
        errorSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        downloadBtn.disabled = true;
        downloadBtn.classList.add('opacity-50');
        updateProgress(15, "Đang giải mã gói dữ liệu video...");

        try {
            // Thực thi kết nối đến API gốc
            const response = await fetchWithRetry(`https://www.tikwm.com/api/?url=${encodeURIComponent(inputUrl)}`);
            const resData = await response.json();

            if (resData && resData.code === 0 && resData.data) {
                const info = resData.data;

                extractedLinks.video = info.play;
                extractedLinks.hdVideo = info.hdplay || info.play;
                extractedLinks.audio = info.music;

                authorName.textContent = info.author.nickname || "TikTok User";
                authorUsername.textContent = `@${info.author.unique_id || "username"}`;
                authorAvatar.src = info.author.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80";
                videoDesc.textContent = info.title || "Không có tiêu đề mô tả.";

                if (info.play) {
                    videoPreview.src = info.play;
                    videoPreview.classList.remove('hidden');
                    videoPlaceholder.classList.add('hidden');
                } else {
                    videoPreview.classList.add('hidden');
                    videoPlaceholder.classList.remove('hidden');
                }

                // TẢI THẲNG VIDEO KHÔNG DÍNH LOGO VỀ MÁY NGAY LẬP TỨC
                updateProgress(45, "Xác minh dữ liệu hoàn tất! Bắt đầu tải video...");
                const uniqueId = info.id || Date.now();
                await triggerDirectDownload(extractedLinks.video, `NizeTik_${uniqueId}.mp4`);

                resultSection.classList.remove('hidden');
            } else {
                await tryBackupAPI(inputUrl);
            }

        } catch (err) {
            await tryBackupAPI(inputUrl);
        } finally {
            loadingSection.classList.add('hidden');
            downloadBtn.disabled = false;
            downloadBtn.classList.remove('opacity-50');
        }
    });
}

// Máy chủ kết nối dự phòng
async function tryBackupAPI(url) {
    updateProgress(30, "Đang định tuyến máy chủ dự phòng...");
    try {
        const response = await fetchWithRetry(`https://api.tik-tok-download.com/api/video/info?url=${encodeURIComponent(url)}`);
        const resData = await response.json();

        if (resData && resData.status === "success" && resData.video) {
            extractedLinks.video = resData.video.noWatermark;
            extractedLinks.hdVideo = resData.video.watermark || resData.video.noWatermark;
            extractedLinks.audio = resData.music?.playUrl || '';

            authorName.textContent = resData.author?.nickname || "TikTok User";
            authorUsername.textContent = `@${resData.author?.username || "username"}`;
            authorAvatar.src = resData.author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80";
            videoDesc.textContent = resData.title || "Không có mô tả.";

            if (extractedLinks.video) {
                videoPreview.src = extractedLinks.video;
                videoPreview.classList.remove('hidden');
                videoPlaceholder.classList.add('hidden');
            }

            // Tải video ngay
            updateProgress(65, "Bắt đầu tải trực tiếp video từ luồng dự phòng...");
            await triggerDirectDownload(extractedLinks.video, `NizeTik_${Date.now()}.mp4`);

            resultSection.classList.remove('hidden');
        } else {
            throw new Error("Lỗi bóc tách.");
        }
    } catch (fallbackErr) {
        alertMessage("Không thể giải mã dữ liệu của liên kết này. Hãy đảm bảo video của bạn ở chế độ công khai.");
    }
}

// Hàm fetch tự phục hồi thông minh
async function fetchWithRetry(url, options = {}, retries = 3, backoff = 1000) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error("Cổng kết nối thất bại");
        return response;
    } catch (err) {
        if (retries > 1) {
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        } else {
            throw err;
        }
    }
}

// Xử lý các sự kiện click tải lại thủ công trên giao diện
if (dlNoWatermark) {
    dlNoWatermark.addEventListener('click', async () => {
        if (!extractedLinks.video) return;
        loadingSection.classList.remove('hidden');
        await triggerDirectDownload(extractedLinks.video, `NizeTik_Video_${Date.now()}.mp4`);
        loadingSection.classList.add('hidden');
    });
}

if (dlNoWatermarkHD) {
    dlNoWatermarkHD.addEventListener('click', async () => {
        if (!extractedLinks.hdVideo) return;
        loadingSection.classList.remove('hidden');
        await triggerDirectDownload(extractedLinks.hdVideo, `NizeTik_HD_${Date.now()}.mp4`);
        loadingSection.classList.add('hidden');
    });
}

if (dlAudio) {
    dlAudio.addEventListener('click', async () => {
        if (!extractedLinks.audio) {
            showToast("Video này không có tệp âm thanh MP3 riêng biệt.");
            return;
        }
        loadingSection.classList.remove('hidden');
        await triggerDirectDownload(extractedLinks.audio, `NizeTik_Audio_${Date.now()}.mp3`);
        loadingSection.classList.add('hidden');
    });
}

// Khôi phục giao diện trống
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        resultSection.classList.add('hidden');
        tiktokUrlInput.value = "";
        charCount.textContent = "0 ký tự";
        videoPreview.src = "";
        videoPreview.classList.add('hidden');
        videoPlaceholder.classList.remove('hidden');
        extractedLinks = { video: '', hdVideo: '', audio: '' };
        tiktokUrlInput.focus();
    });
}