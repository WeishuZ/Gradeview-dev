import config from 'config';
import { OAuth2Client } from 'google-auth-library';
import AuthorizationError from './errors/http/AuthorizationError.js';

/**
 * Gets an email from a google auth token.
 * @param {string} token user token to retrieve email from.
 * @returns {string} user's email.
 */
export async function getEmailFromAuth(token) {
    const googleOauthAudience = config.get('googleconfig.oauth.clientid');
    try {
        let oauthClient = new OAuth2Client(googleOauthAudience);
        const ticket = await oauthClient.verifyIdToken({
            idToken: token.split(' ')[1],
            audience: googleOauthAudience,
        });
        const payload = ticket.getPayload();
        if (payload['hd'] !== 'berkeley.edu') {
            throw new AuthorizationError('domain mismatch');
        }
        return payload['email'];
    } catch (err) {
        console.error('Error during Google authorization:', err);
        throw new AuthorizationError(
            'Could not authenticate authorization token.',
        );
    }
}

/**
 * Ensures that an email is a properly formatted berkeley email.
 * @param {string} email email to verify.
 * @returns {boolean} success of verification.
 * @deprecated
 */
export function verifyBerkeleyEmail(email) {
    return (
        email.split('@').length === 2 && email.split('@')[1] === 'berkeley.edu'
    );
}

// TODO: check if the user is included in the list of users (in the db);
/**
 * Checks to see if an email is a student email or an admin.
 * @param {string} email email to check access to.
 * @returns {boolean} whether the email is an admin or student.
 * @deprecated use api/lib/userlib.mjs middlewares instead.
 */
export function ensureStudentOrAdmin(email) {
    const isAdmin = config.get('admins').includes(email);
    return isAdmin;
}


// /**
//  * @param {string} tokenString 完整的 Authorization header value (e.g., 'Bearer abc123xyz').
//  * @returns {string} The raw Token value (e.g., 'abc123xyz').
//  * @throws {AuthorizationError} if the format is invalid.
//  */
// function extractRawToken(tokenString) {
//     if (!tokenString || !tokenString.startsWith('Bearer ')) {
//         throw new AuthorizationError('Invalid authorization token format.');
//     }
//     return tokenString.split(' ')[1]; 
// }

// /**
//  * Validates the ID Token, gets the email, and returns the raw Token value.
//  * NOTE: This returns the ID Token, which is being used in lieu of a separate Access Token 
//  * for temporary authentication purposes.
//  * * @param {string} token user token to retrieve email from (Full "Bearer <TOKEN>" string).
//  * @returns {{email: string, idToken: string}} Object containing the user's email and the raw token string.
//  */
// export async function getEmailAndTokenFromAuth(token) {
//     const googleOauthAudience = config.get('googleconfig.oauth.clientid');
    
//     // 1. 提取裸 Token
//     const rawToken = extractRawToken(token);
    
//     try {
//         let oauthClient = new OAuth2Client(googleOauthAudience);
//         const ticket = await oauthClient.verifyIdToken({
//             idToken: rawToken, // 使用提取出的裸 token
//             audience: googleOauthAudience,
//         });
//         const payload = ticket.getPayload();
        
//         if (payload['hd'] !== 'berkeley.edu') {
//             throw new AuthorizationError('domain mismatch');
//         }
        
//         return { 
//             email: payload['email'],
//             idToken: rawToken 
//         };
        
//     } catch (err) {
//         console.error('Error during Google authorization:', err);
//         throw new AuthorizationError(
//             'Could not authenticate authorization token.',
//         );
//     }
// }