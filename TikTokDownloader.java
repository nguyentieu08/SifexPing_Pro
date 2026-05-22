package com.nizetik.downloader;

import java.io.BufferedInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * -------------------------------------------------------------
 * NizeTik - Java Backend Controller (TikTok Watermark Remover)
 * Nhà phát triển: Nguyễn Tiêu (v1.5 Separated Edition)
 * Lớp xử lý nghiệp vụ máy chủ hỗ trợ download và bảo mật nguồn
 * -------------------------------------------------------------
 */
public class TikTokDownloader {

    private static final String API_GATEWAY = "https://www.tikwm.com/api/?url=";

    /**
     * Phương thức tải trực tiếp tệp tin từ máy chủ không lộ URL thật ra phía trình duyệt
     * @param targetUrl Liên kết CDN của video TikTok nhận được sau bóc tách
     * @param outputPath Đường dẫn lưu trữ tệp trên Server local của bạn
     * @return boolean Trả về kết quả tải tệp thành công hay thất bại
     */
    public boolean downloadVideoDirectly(String targetUrl, String outputPath) {
        System.out.println("[NizeTik System] Khởi chạy luồng tải trực tiếp tệp về máy chủ...");
        
        try {
            URL url = new URL(targetUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            
            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                try (BufferedInputStream in = new BufferedInputStream(connection.getInputStream());
                     FileOutputStream fileOutputStream = new FileOutputStream(outputPath)) {
                    
                    byte[] dataBuffer = new byte[4096];
                    int bytesRead;
                    while ((bytesRead = in.read(dataBuffer, 0, 1024)) != -1) {
                        fileOutputStream.write(dataBuffer, 0, bytesRead);
                    }
                    System.out.println("[NizeTik System] Tải thành công tệp tin về đường dẫn: " + outputPath);
                    return true;
                }
            } else {
                System.err.println("[Error] Máy chủ CDN TikTok phản hồi lỗi mã Code: " + responseCode);
                return false;
            }
        } catch (IOException e) {
            System.err.println("[Error] Đã xảy ra lỗi nghiêm trọng khi đọc luồng tải tệp tin: " + e.getMessage());
            return false;
        }
    }

    /**
     * Phương thức phân tích liên kết TikTok đầu vào thông qua API của NizeTik
     * @param tiktokUrl Liên kết video TikTok do người dùng cung cấp
     * @return String Chuỗi dữ liệu JSON bóc tách chi tiết (Video, Audio, Tác giả)
     */
    public String parseTikTokLink(String tiktokUrl) {
        StringBuilder result = new StringBuilder();
        try {
            String encodedUrl = URLEncoder.encode(tiktokUrl, StandardCharsets.UTF_8.toString());
            URL url = new URL(API_GATEWAY + encodedUrl);
            
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (NizeTik-Server; Developer: NguyenTieu)");

            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                try (BufferedInputStream in = new BufferedInputStream(conn.getInputStream())) {
                    byte[] buffer = new byte[1024];
                    int bytesRead;
                    while ((bytesRead = in.read(buffer)) != -1) {
                        result.append(new String(buffer, 0, bytesRead, StandardCharsets.UTF_8));
                    }
                }
            } else {
                return "{\"code\": -1, \"msg\": \"Máy chủ API Gateway lỗi kết nối.\"}";
            }
        } catch (Exception e) {
            return "{\"code\": -2, \"msg\": \"Lỗi Exception: " + e.getMessage() + "\"}";
        }
        return result.toString();
    }

    /**
     * Điểm chạy ứng dụng kiểm thử độc lập phía Backend Java
     */
    public static void main(String[] args) {
        System.out.println("=== NIZETIK BACKEND ENGINE v1.5 ===");
        System.out.println("Bản quyền hệ thống thuộc về Nguyễn Tiêu.");
        
        TikTokDownloader downloader = new TikTokDownloader();
        
        // Ví dụ chạy thử phân tích và lưu tệp về Server máy chủ
        String testUrl = "https://www.tiktok.com/@khaby.lame/video/7123456789123456789";
        System.out.println("Đang bóc tách thử nghiệm link: " + testUrl);
        
        // Bạn có thể phát triển thêm Servlet/Controller để bắt các Request từ app.js gửi đến.
    }
}