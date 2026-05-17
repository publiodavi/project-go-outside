import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

function App() {
  const [cidade, setCidade] = useState('');
  const [clima, setClima] = useState(null);
  
  // Estados novos para controlar as sugestões de cidade
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  // Efeito que monitora o que você digita e busca as sugestões
  useEffect(() => {
    if (cidade.length < 3) {
      setSugestoes([]);
      return;
    }

    const delayBusca = setTimeout(async () => {
      try {
        // A mágica acontece aqui: limit=1
        const urlGeo = `https://api.openweathermap.org/geo/1.0/direct?q=${cidade}&limit=1&appid=${apiKey}`;
        const resposta = await fetch(urlGeo);
        if (resposta.ok) {
          const dados = await resposta.json();
          setSugestoes(dados);
        }
      } catch (erro) {
        console.error("Erro ao buscar sugestões", erro);
      }
    }, 500);

    return () => clearTimeout(delayBusca);
  }, [cidade, apiKey]);

  const definirClasseDoClima = (dados) => {
    if (!dados) return ''; 
    const condicao = dados.weather[0].main; 
    const temp = dados.main.temp;   
    const isNoite = dados.weather[0].icon.includes('n');

    const climaEsquisito = ['Mist', 'Smoke', 'Haze', 'Dust', 'Fog', 'Sand', 'Ash', 'Squall', 'Tornado'];

    if (temp < 0) return 'neve-extrema'; 
    if (condicao === 'Snow') return isNoite ? 'neve-noite' : 'neve-dia';
    if (condicao === 'Thunderstorm') return 'tempestade';
    if (condicao === 'Rain' || condicao === 'Drizzle') return isNoite ? 'chuva-noite' : 'chuva-dia';
    if (temp <= 5) return 'neve-extrema'; 
    
    if (climaEsquisito.includes(condicao)) return isNoite ? 'nevoa-noite' : 'nevoa-dia';
    
    if (condicao === 'Clear') {
      if (isNoite) return 'noite-limpa';
      if (temp >= 30) return 'sol-calor';
      return 'sol-agradavel';
    }
    
    if (condicao === 'Clouds') return isNoite ? 'nublado-noite' : 'nublado-dia';
    
    return ''; 
  };

  // Busca o clima quando o usuário aperta "Enter" (buscando pelo texto)
  const buscarClima = async () => {
    if (!cidade) return; 
    setMostrarSugestoes(false); // Esconde a listinha
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
      const resposta = await fetch(url);
      if (!resposta.ok) { alert("Cidade não encontrada."); return; }
      const dados = await resposta.json();
      setClima(dados);
    } catch (erro) { console.error("falha na requisicao", erro); }
  };

  // Busca o clima exato quando o usuário CLICA na sugestão da lista
  const selecionarSugestao = async (lat, lon, nomeCidade, estado) => {
    setMostrarSugestoes(false);
    
    // Voltando a barra de pesquisa pro formato completo "Cidade, Estado"
    setCidade(estado ? `${nomeCidade}, ${estado}` : nomeCidade); 
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
    
    try {
      const resposta = await fetch(url);
      if (resposta.ok) {
        const dados = await resposta.json();
        
        // Mantemos a mágica pro card ficar limpo, só com o nome da cidade!
        dados.name = nomeCidade; 
        
        setClima(dados);
      }
    } catch (erro) { console.error("falha na requisicao por coordenada", erro); }
  };

  const pegarHoraLocal = (timezone) => {
    const dataUtc = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
    const dataCidade = new Date(dataUtc.getTime() + timezone * 1000);
    return dataCidade.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const classeFundo = definirClasseDoClima(clima);

  const BackgroundVideo = {
    'sol-calor': '/videos/sol-calor.mp4',
    'sol-agradavel': '/videos/sol-agradavel.mp4',
    'noite-limpa': '/videos/noite-limpa.mp4',
    'nublado-dia': '/videos/nublado-dia.mp4',
    'nublado-noite': '/videos/nublado-noite.mp4',
    'chuva-dia': '/videos/chuva-dia.mp4',   
    'chuva-noite': '/videos/chuva-noite.mp4', 
    'tempestade': '/videos/tempestade.mp4',
    'neve-dia': '/videos/neve-dia.mp4',
    'neve-noite': '/videos/neve-noite.mp4',
    'neve-extrema': '/videos/neve-extrema.mp4',
    'nevoa-dia': '/videos/nevoa-dia.mp4',
    'nevoa-noite': '/videos/nevoa-noite.mp4',
  };

  return (
    <div className="app-container">
      {BackgroundVideo[classeFundo] && (
        <video 
          key={BackgroundVideo[classeFundo]} 
          autoPlay loop muted playsInline 
          className="bg-video"
        >
          <source src={BackgroundVideo[classeFundo]} type="video/mp4" />
        </video>
      )}

      {/* Container que agrupa o input e a lista de sugestões */}
      <div className="search-wrapper">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search for a city..." 
            value={cidade}
            onChange={(e) => {
              setCidade(e.target.value);
              setMostrarSugestoes(true);
            }}
            onKeyDown={(e) => e.key === 'Enter' && buscarClima()}
          />
        </div>

        {/* Renderiza a lista suspensa se tiver digitado algo e achado sugestões */}
        {mostrarSugestoes && sugestoes.length > 0 && (
          <ul className="sugestoes-lista">
            {sugestoes.map((local, index) => (
              <li 
                key={index} 
                onClick={() => selecionarSugestao(local.lat, local.lon, local.name, local.state)}
              >
                {local.name} {local.state ? `- ${local.state}` : ''} <span className="sugestao-pais">({local.country})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence mode="wait">
        {clima && clima.main && (
          <motion.div 
            key={clima.name} 
            className="weather-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h2 className="cidade-nome">{clima.name}</h2>
            <h1 className="temp-grande">{Math.round(clima.main.temp)}°</h1>
            <div className="info-secundaria">
              <span className="hora-local">{pegarHoraLocal(clima.timezone)}</span>
              <span className="separador">•</span>
              <span className="desc-clima">{clima.weather[0].description}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;