// --- לוגיקת כפתור הפלוס (בדיקת התחברות והפניה) ---
const plusButton = document.getElementById('plusBtn') as HTMLButtonElement | null;

if (plusButton) {
    plusButton.addEventListener('click', (): void => {
        // בודק את המפתחות הנפוצים ב-localStorage (השרת שלך משתמש ב-token)
        const token: string | null = localStorage.getItem('token');
        const user: string | null = localStorage.getItem('user');

        if (token || user) {
            // אם המשתמש מחובר -> מעביר לעמוד הוספת מוצר
            window.location.href = 'other.html';
        } else {
            // אם המשתמש לא מחובר -> מעביר לעמוד התחברות
            window.location.href = 'logIn.html';
        }
    });
}   