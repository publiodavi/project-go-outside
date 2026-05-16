import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

function App() {
  const [cidade, setCidade] = useState('');
  const [clima, setClima] = useState(null);

  const definirClasseDoClima = (dados) => {
    if (!dados) return ''; 
    const condicao = dados.weather[0].main; 
    const temp = dados.main.temp;   
    const isNoite = dados.weather[0].icon.includes('n');

    if (temp < 0) return 'neve-extrema'; 
    if (condicao === 'Snow') return isNoite ? 'neve-noite' : 'neve-dia';
    if (condicao === 'Thunderstorm') return 'tempestade';
    if (condicao === 'Rain' || condicao === 'Drizzle') return isNoite ? 'chuva-noite' : 'chuva-dia';
    if (temp <= 5) return 'neve-extrema'; 
    
    if (condicao === 'Clear') {
      if (isNoite) return 'noite-limpa';
      if (temp >= 30) return 'sol-calor';
      return 'sol-agradavel';
    }
    
    if (condicao === 'Clouds') return isNoite ? 'nublado-noite' : 'nublado-dia';
    return ''; 
  };

  const buscarClima = async () => {
    if (!cidade) return; 
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
      const resposta = await fetch(url);
      if (!resposta.ok) { 
        alert("Cidade não encontrada. Digite o nome correto!"); 
        return; 
      }
      const dados = await resposta.json();
      setClima(dados);
    } catch (erro) { 
      console.error("falha na requisicao", erro); 
    }
  };

  const classeFundo = definirClasseDoClima(clima);

  const BackgroundVideo = {
    'sol-calor': '/videos/sol-calor.mp4',
    'sol-agradavel': '/videos/sol-agradavel.mp4',
    'noite-limpa': '/videos/noite-limpa.mp4',
    'nublado-dia': '/videos/nublado-dia.mp4',
    'nublado-noite': '/videos/nublado-noite.mp4',
    'chuva-dia': '/videos/dia-chuva.mp4',   
    'chuva-noite': '/videos/dia-noite.mp4', 
    'tempestade': '/videos/tempestade.mp4',
    'neve-dia': '/videos/neve-dia.mp4',
    'neve-noite': '/videos/neve-noite.mp4',
    'neve-extrema': '/videos/neve-extrema.mp4',
  };

  const mapaDeCores = {
    'sol-agradavel': '#4facfe',
    'sol-calor': '#ff0844',
    'chuva-dia': '#606c88',
    'chuva-noite': '#0f2027',
    'neve-extrema': '#e0c3fc',
    'noite-limpa': '#141e30',
    'nublado-dia': '#8e9eab',
    'nublado-noite': '#232526',
    'tempestade': '#1e130c',
    '': '#8ec5fc'
  };

  return (
    <motion.div 
      className="app-container"
      animate={{ backgroundColor: mapaDeCores[classeFundo] || '#8ec5fc' }}
      transition={{ duration: 1.5 }}
    >
      {BackgroundVideo[classeFundo] && (
        <video 
          key={BackgroundVideo[classeFundo]} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="bg-video"
        >
          <source src={BackgroundVideo[classeFundo]} type="video/mp4" />
        </video>
      )}

      <h1 className="app-title">Go Outside 🌤️</h1>
      
      <div className="search-box">
        <input 
          type="text" 
          placeholder="Digite a cidade..." 
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarClima()}
        />
        <button onClick={buscarClima}>Buscar</button>
      </div>

      <AnimatePresence mode="wait">
        {clima && clima.main && (
          <motion.div 
            key={clima.name} 
            className="weather-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-header">
              <h2>{clima.name}</h2>
              <img 
                src={`https://flagcdn.com/w80/${clima.sys.country.toLowerCase()}.png`} 
                alt={clima.sys.country} 
                className="country-flag"
              />
            </div>

            <h1 className="temp-grande">{Math.round(clima.main.temp)}°C</h1>
            <p className="desc-clima">
              {clima.weather[0].description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default App;