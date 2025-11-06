import Navbar from './components/Navbar';

export default function Home() {
  return (
    <main style={{ background: 'white', minHeight: '100vh', color: 'black' }}>
      <Navbar />
      <div style={{
        background: 'white',
        color: 'black',
        margin: '2rem auto',
        padding: '2rem',
        borderRadius: '10px',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h1>Welcome to the Todo App</h1>
      </div>
    </main>
  );
}
