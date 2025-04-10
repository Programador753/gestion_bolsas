export default function Footer() {
    return (
        <footer style={{ textAlign: "center", padding: "1rem", background: "red" }}>
            © {new Date().getFullYear()} Salesianos Zaragoza
        </footer>
    );
}