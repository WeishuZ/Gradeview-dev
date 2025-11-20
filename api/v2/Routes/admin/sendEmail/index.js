// /////////////////////////////////////////
// FILE: admin/email/index.js (完整版)
// /////////////////////////////////////////

import { Router } from 'express';
// 假设 sendEmailWithToken 已经更新为接收 tokenString 和 email
import { getEmailAndTokenFromAuth } from '../../../../lib/googleAuthHelper.mjs'; // 假设 getEmailFromAuth 在这里可用

const router = Router({ mergeParams: true });

/**
 * 辅助函数：将学生列表转换为 HTML 表格
 * @param {Array<{name: string, email: string}>} studentList 
 * @param {string} assignmentName
 * @param {number} score
 * @returns {string} HTML 格式的表格
 */
function createStudentListHtml(studentList, assignmentName, score) {
    if (studentList.length === 0) {
        return `<p>No students found with a score of ${score} on ${assignmentName}.</p>`;
    }

    let html = `
        <p>The following ${studentList.length} students achieved a score of <strong>${score}</strong> on the assignment <strong>${assignmentName}</strong>:</p>
        <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 15px;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="text-align: left; padding: 8px;">Name</th>
                    <th style="text-align: left; padding: 8px;">Email</th>
                </tr>
            </thead>
            <tbody>
    `;

    studentList.forEach(student => {
        html += `
            <tr>
                <td style="padding: 8px;">${student.name}</td>
                <td style="padding: 8px;">${student.email}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    return html;
}

/**
 * POST /scoreList
 * 发送包含特定分数学生列表的邮件，使用当前登录管理员的 Access Token
 */
router.post('/scoreList', async (req, res) => {
    // 1. 从请求头直接获取完整的 Bearer Token 字符串
    let sender = await getEmailAndTokenFromAuth(req.headers['authorization'] || '');

    if (!sender) {
        return res.status(401).json({ error: "Authorization token required." });
    }
    
    // 2. 使用现有的 getEmailFromAuth 逻辑来确认发件人邮箱
    try {
        // 这同时也验证了 Token 的有效性
        senderEmail = sender.email;
        tokenString = sender.tokenString;
    } catch (e) {
        // 如果 Token 无效或过期，getEmailFromAuth 应该抛出错误
        return res.status(401).json({ error: "Invalid or expired authorization token. Please log in again." });
    }

    const { 
        recipient, 
        subject, 
        body, 
        assignmentName, 
        score, 
        studentList 
    } = req.body;

    // 基础校验
    if (!recipient || !subject || !Array.isArray(studentList)) {
        return res.status(400).json({ error: "Missing recipient, subject, or student list data." });
    }

    try {
        // 3. 格式化学生列表为 HTML
        const studentTableHtml = createStudentListHtml(studentList, assignmentName, score);
        
        // 4. 组合邮件正文
        const fullHtmlBody = `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto;">
                    ${body ? `<p>${body.replace(/\n/g, '<br>')}</p><hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>` : ''}
                    
                    ${studentTableHtml}
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                    <p style="font-size: 0.8em; color: #777;">This list was requested by an administrator (${senderEmail}) from the Admin Dashboard.</p>
                </div>
            </body>
            </html>
        `;

        // 5. 发送邮件，直接传递整个 tokenString
        const mailResponse = await sendEmailWithToken({
            tokenString: tokenString, // 传递完整的 "Bearer <TOKEN>" 字符串
            to: recipient,
            subject: subject,
            htmlContent: fullHtmlBody,
            userEmail: senderEmail // 发件人
        });
        
        res.json({ message: "Email sent successfully!", messageId: mailResponse.messageId });

    } catch (error) {
        console.error("API Error during score list email send:", error);
        
        let errorMessage = error.message;
        if (errorMessage.includes("401") || errorMessage.includes("expired")) {
             errorMessage = "Failed to send email. The login session (Access Token) may have expired. Please refresh the page and log in again.";
        }
        
        res.status(500).json({ error: errorMessage });
    }
});

export default router;