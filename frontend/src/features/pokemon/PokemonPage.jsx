import { useState, useEffect, useCallback } from 'react';
import '@/styles/GlassDesignSystem.css';
import '@/styles/features/Pokemon.css';
import { useToast, ToastContainer } from '@/components/ui/Toast';

// ═══════════════════════════════════════════════════════════════
// Pokémon Hub - Type Colors & Charts
// ═══════════════════════════════════════════════════════════════

const TYPE_COLORS = {
    normal:'#A8A878', fire:'#F08030', water:'#6890F0', electric:'#F8D030',
    grass:'#78C850', ice:'#98D8D8', fighting:'#C03028', poison:'#A040A0',
    ground:'#E0C068', flying:'#A890F0', psychic:'#F85888', bug:'#A8B820',
    rock:'#B8A038', ghost:'#705898', dragon:'#7038F8', dark:'#705848',
    steel:'#B8B8D0', fairy:'#EE99AC',
};

const TYPE_CHART = {
    fire:    { grass:2, ice:2, bug:2, steel:2, water:0.5, fire:0.5, rock:0.5, dragon:0.5 },
    water:   { fire:2, ground:2, rock:2, water:0.5, grass:0.5, dragon:0.5 },
    grass:   { water:2, ground:2, rock:2, fire:0.5, grass:0.5, poison:0.5, flying:0.5, bug:0.5, dragon:0.5, steel:0.5 },
    electric:{ water:2, flying:2, electric:0.5, grass:0.5, dragon:0.5, ground:0 },
    normal:  { rock:0.5, steel:0.5, ghost:0 },
    dark:    { ghost:2, psychic:2, dark:0.5, fighting:0.5, fairy:0.5 },
    psychic: { fighting:2, poison:2, psychic:0.5, dark:0, steel:0.5 },
    ice:     { grass:2, ground:2, flying:2, dragon:2, fire:0.5, water:0.5, ice:0.5, steel:0.5 },
    dragon:  { dragon:2, steel:0.5, fairy:0 },
    ghost:   { ghost:2, psychic:2, normal:0, dark:0.5 },
    bug:     { grass:2, psychic:2, dark:2, fire:0.5, fighting:0.5, flying:0.5, ghost:0.5, steel:0.5, fairy:0.5 },
    poison:  { grass:2, fairy:2, poison:0.5, ground:0.5, rock:0.5, ghost:0.5, steel:0 },
    rock:    { fire:2, ice:2, flying:2, bug:2, fighting:0.5, ground:0.5, steel:0.5 },
    ground:  { fire:2, electric:2, poison:2, rock:2, steel:2, grass:0.5, bug:0.5, flying:0 },
    flying:  { grass:2, fighting:2, bug:2, electric:0.5, rock:0.5, steel:0.5 },
    fighting:{ normal:2, ice:2, rock:2, dark:2, steel:2, poison:0.5, bug:0.5, psychic:0.5, flying:0.5, fairy:0.5, ghost:0 },
    steel:   { ice:2, rock:2, fairy:2, fire:0.5, water:0.5, electric:0.5, steel:0.5 },
    fairy:   { fighting:2, dragon:2, dark:2, fire:0.5, poison:0.5, steel:0.5 },
};

function getTypeEffectiveness(moveType, defenderTypes) {
    const chart = TYPE_CHART[moveType] || {};
    return (defenderTypes || []).reduce((eff, t) => eff * (chart[t] ?? 1), 1);
}

// ═══════════════════════════════════════════════════════════════
// Moves Database
// ═══════════════════════════════════════════════════════════════

const MOVES = {
    'tackle':        { name:'tackle',        displayName:'Tackle',        type:'normal',   category:'physical', power:40, accuracy:100, pp:35 },
    'scratch':       { name:'scratch',       displayName:'Scratch',       type:'normal',   category:'physical', power:40, accuracy:100, pp:35 },
    'ember':         { name:'ember',         displayName:'Ember',         type:'fire',     category:'special',  power:40, accuracy:100, pp:25, statusChance:10, status:'burned' },
    'water gun':     { name:'water gun',     displayName:'Water Gun',     type:'water',    category:'special',  power:40, accuracy:100, pp:25 },
    'thunder shock': { name:'thunder shock', displayName:'Thunder Shock', type:'electric', category:'special',  power:40, accuracy:100, pp:30, statusChance:10, status:'paralyzed' },
    'vine whip':     { name:'vine whip',     displayName:'Vine Whip',     type:'grass',    category:'physical', power:45, accuracy:100, pp:25 },
    'bite':          { name:'bite',          displayName:'Bite',          type:'dark',     category:'physical', power:60, accuracy:100, pp:25 },
    'quick attack':  { name:'quick attack',  displayName:'Quick Attack',  type:'normal',   category:'physical', power:40, accuracy:100, pp:30, priority:1 },
    'flamethrower':  { name:'flamethrower',  displayName:'Flamethrower',  type:'fire',     category:'special',  power:90, accuracy:100, pp:15 },
    'surf':          { name:'surf',          displayName:'Surf',          type:'water',    category:'special',  power:90, accuracy:100, pp:15 },
    'thunderbolt':   { name:'thunderbolt',   displayName:'Thunderbolt',   type:'electric', category:'special',  power:90, accuracy:100, pp:15 },
    'solar beam':    { name:'solar beam',    displayName:'Solar Beam',    type:'grass',    category:'special',  power:120, accuracy:100, pp:10 },
    'growl':         { name:'growl',         displayName:'Growl',         type:'normal',   category:'status',   power:0,  accuracy:100, pp:40 },
    'tail whip':     { name:'tail whip',     displayName:'Tail Whip',     type:'normal',   category:'status',   power:0,  accuracy:100, pp:30 },
    'leer':          { name:'leer',          displayName:'Leer',          type:'normal',   category:'status',   power:0,  accuracy:100, pp:30 },
    'protect':       { name:'protect',       displayName:'Protect',       type:'normal',   category:'status',   power:0,  accuracy:100, pp:10 },
    'thunder wave':  { name:'thunder wave',  displayName:'Thunder Wave',  type:'electric', category:'status',   power:0,  accuracy:90,  pp:20 },
    'poison powder': { name:'poison powder', displayName:'Poison Powder', type:'poison',   category:'status',   power:0,  accuracy:75,  pp:35 },
};

const MOVESETS = {
    pikachu:     ['thunder shock','quick attack','thunderbolt','thunder wave','growl','tail whip'],
    raichu:      ['thunder shock','quick attack','thunderbolt','thunder wave','growl','tail whip'],
    charmander:  ['scratch','ember','growl','leer','bite','flamethrower'],
    charmeleon:  ['scratch','ember','growl','leer','bite','flamethrower'],
    charizard:   ['scratch','ember','flamethrower','bite','leer','growl'],
    squirtle:    ['tackle','water gun','tail whip','protect','surf','growl'],
    wartortle:   ['tackle','water gun','tail whip','protect','surf','growl'],
    blastoise:   ['tackle','water gun','surf','protect','tail whip','growl'],
    bulbasaur:   ['tackle','vine whip','growl','poison powder','solar beam','protect'],
    ivysaur:     ['tackle','vine whip','growl','poison powder','solar beam','protect'],
    venusaur:    ['tackle','vine whip','solar beam','poison powder','protect','growl'],
    default:     ['tackle','growl','quick attack','leer','bite','protect'],
};

function getMovesForPokemon(name) {
    const key = (name || '').toLowerCase();
    const set = MOVESETS[key] || MOVESETS.default;
    return set.map(n => MOVES[n] ? { ...MOVES[n], maxPP: MOVES[n].pp } : null).filter(Boolean);
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

function normalizePokemon(p) {
    if (!p) return null;
    const n = JSON.parse(JSON.stringify(p));
    if (!n.stats) n.stats = { hp:50, attack:50, defense:50, specialAttack:50, specialDefense:50, speed:50 };
    else n.stats = { hp:50, attack:50, defense:50, specialAttack:50, specialDefense:50, speed:50, ...n.stats };
    if (typeof n.currentHP === 'undefined') n.currentHP = n.stats.hp;
    n.currentHP = Math.max(0, Math.min(n.stats.hp, Number(n.currentHP) || n.stats.hp));
    if (!n.level || n.level < 1) n.level = 5;
    if (!n.sprite) n.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${n.id || 1}.png`;
    if (!n.types) n.types = ['normal'];
    return n;
}

function calcDamage(level, attack, defense, power, moveType, defenderTypes) {
    let dmg = Math.floor((2 * level + 10) / 250 * (attack / Math.max(1, defense)) * power + 2);
    const eff = getTypeEffectiveness(moveType, defenderTypes);
    dmg = Math.floor(dmg * eff * (0.85 + Math.random() * 0.15));
    const crit = Math.random() < 0.0625;
    if (crit) dmg = Math.floor(dmg * 1.5);
    return { dmg: Math.max(1, dmg), crit, eff };
}

function getTeam() {
    try { return JSON.parse(localStorage.getItem('pokemonTeam') || '[]'); }
    catch { return []; }
}
function saveTeam(team) {
    localStorage.setItem('pokemonTeam', JSON.stringify(team));
}

// ═══════════════════════════════════════════════════════════════
// UI Components
// ═══════════════════════════════════════════════════════════════

function TypeBadge({ type }) {
    return (
        <span className="poke-type-badge" style={{ background: TYPE_COLORS[type] || '#888' }}>
            {type}
        </span>
    );
}

function StatBar({ label, value }) {
    const pct = Math.min(100, Math.round((value / 255) * 100));
    const color = value > 100 ? '#4ade80' : value > 60 ? '#facc15' : '#f87171';
    return (
        <div className="poke-stat-row">
            <span className="poke-stat-label">{label}</span>
            <span className="poke-stat-val">{value}</span>
            <div className="poke-stat-bar">
                <div className="poke-stat-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TAB 1 — POKÉDEX
// ═══════════════════════════════════════════════════════════════

function PokedexTab({ toast }) {
    const [searchInput, setSearchInput] = useState('');
    const [pokemon, setPokemon] = useState(null);
    const [currentId, setCurrentId] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addedToTeam, setAddedToTeam] = useState(false);

    const fetchPokemon = useCallback(async (query) => {
        setLoading(true);
        setError('');
        setAddedToTeam(false);
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${String(query).toLowerCase().trim()}`);
            if (!res.ok) throw new Error('Not found');
            const data = await res.json();
            setCurrentId(data.id);
            setPokemon(data);
            setSearchInput(data.name.charAt(0).toUpperCase() + data.name.slice(1));
        } catch {
            setError(`Pokémon "${query}" not found.`);
            setPokemon(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPokemon(1); }, [fetchPokemon]);

    const handleSubmit = (e) => { e.preventDefault(); if (searchInput.trim()) fetchPokemon(searchInput.trim()); };

    const addToTeam = () => {
        if (!pokemon) return;
        const team = getTeam();
        if (team.length >= 6) { toast.warning('Your team is full! Remove a Pokémon first.'); return; }
        if (team.some(p => p.id === pokemon.id)) { toast.info(`${pokemon.name} is already on your team!`); return; }
        const sprite = pokemon.sprites?.other?.['official-artwork']?.front_default
            || pokemon.sprites?.other?.dream_world?.front_default
            || pokemon.sprites?.front_default;
        const newMember = {
            id: pokemon.id,
            name: pokemon.name,
            sprite,
            types: pokemon.types.map(t => t.type.name),
            level: 5,
            currentHP: pokemon.stats[0].base_stat,
            stats: {
                hp: pokemon.stats[0].base_stat,
                attack: pokemon.stats[1].base_stat,
                defense: pokemon.stats[2].base_stat,
                specialAttack: pokemon.stats[3].base_stat,
                specialDefense: pokemon.stats[4].base_stat,
                speed: pokemon.stats[5].base_stat,
            },
        };
        saveTeam([...team, newMember]);
        setAddedToTeam(true);
        toast.success(`${pokemon.name} added to your team!`);
    };

    const sprite = pokemon?.sprites?.other?.['official-artwork']?.front_default
        || pokemon?.sprites?.other?.dream_world?.front_default
        || pokemon?.sprites?.front_default;

    const statMap = { hp:'HP', attack:'ATK', defense:'DEF', 'special-attack':'SP.ATK', 'special-defense':'SP.DEF', speed:'SPD' };

    return (
        <div>
            {/* ─── Search ───────────────────────────────────── */}
            <div className="glass-search-section">
                <form onSubmit={handleSubmit} className="glass-search-box">
                    <input
                        className="glass-input"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Pokémon name or ID…"
                    />
                    <button type="submit" className="glass-btn">🔍 Search</button>
                </form>
            </div>

            {loading && (
                <div className="glass-loading">
                    <div className="glass-spinner" />
                    <p>Loading Pokémon…</p>
                </div>
            )}
            {error && <p className="poke-error">{error}</p>}

            {!loading && !error && pokemon && (
                <div className="poke-card-layout">
                    {/* ─── Left: Sprite & Types ─────────────── */}
                    <div className="glass-card poke-sprite-card">
                        <img src={sprite} alt={pokemon.name} className="poke-sprite-large" />
                        <h2 className="poke-name">
                            #{String(pokemon.id).padStart(3,'0')} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                        </h2>
                        <div className="poke-types">
                            {pokemon.types.map(t => <TypeBadge key={t.type.name} type={t.type.name} />)}
                        </div>
                        <div className="poke-nav-row">
                            <button className="glass-btn-secondary poke-nav-btn" onClick={() => fetchPokemon(Math.max(1, currentId - 1))}>◀ Prev</button>
                            <button className="glass-btn-secondary poke-nav-btn" onClick={() => fetchPokemon(currentId + 1)}>Next ▶</button>
                        </div>
                        <button
                            className={`glass-btn poke-add-btn ${addedToTeam ? 'poke-added' : ''}`}
                            onClick={addToTeam}
                            disabled={addedToTeam}
                        >
                            {addedToTeam ? '✅ Added to Team!' : '➕ Add to Team'}
                        </button>
                    </div>

                    {/* ─── Right: Stats & Abilities ─────────── */}
                    <div className="glass-card poke-info-card">
                        <h3 className="poke-section-title">Base Stats</h3>
                        {pokemon.stats.map(s => (
                            <StatBar key={s.stat.name} label={statMap[s.stat.name] || s.stat.name.toUpperCase()} value={s.base_stat} />
                        ))}

                        <h3 className="poke-section-title">Abilities</h3>
                        <div className="poke-ability-list">
                            {pokemon.abilities.map(a => (
                                <span key={a.ability.name} className={`poke-ability-tag ${a.is_hidden ? 'hidden' : ''}`}>
                                    {a.is_hidden ? '🔮 ' : ''}{a.ability.name.replace('-',' ')}
                                </span>
                            ))}
                        </div>

                        <h3 className="poke-section-title">Info</h3>
                        <div className="poke-info-grid">
                            <div className="poke-info-item"><span>Height</span><strong>{(pokemon.height / 10).toFixed(1)} m</strong></div>
                            <div className="poke-info-item"><span>Weight</span><strong>{(pokemon.weight / 10).toFixed(1)} kg</strong></div>
                            <div className="poke-info-item"><span>Base XP</span><strong>{pokemon.base_experience ?? '—'}</strong></div>
                            <div className="poke-info-item"><span>Moves</span><strong>{pokemon.moves.length}</strong></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TAB 2 — MY TEAM
// ═══════════════════════════════════════════════════════════════

function TeamTab({ toast }) {
    const [team, setTeam] = useState(getTeam);
    const [confirmClear, setConfirmClear] = useState(false);

    const refreshTeam = () => setTeam(getTeam());

    const removePokemon = (id) => {
        const updated = team.filter(p => p.id !== id);
        saveTeam(updated);
        setTeam(updated);
        toast.success('Pokémon removed from team');
    };

    const clearTeam = () => {
        if (!team.length) return;
        saveTeam([]);
        setTeam([]);
        setConfirmClear(false);
        toast.success('Team cleared');
    };

    const emptySlots = Array(Math.max(0, 6 - team.length)).fill(null);

    return (
        <div>
            {confirmClear && (
                <div className="confirm-dialog-overlay" onClick={() => setConfirmClear(false)}>
                    <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                        <h3>Clear Team?</h3>
                        <p>Are you sure you want to remove all Pokémon from your team?</p>
                        <div className="confirm-dialog-actions">
                            <button className="glass-btn-secondary" onClick={() => setConfirmClear(false)}>Cancel</button>
                            <button className="glass-btn" onClick={clearTeam} style={{ background:'rgba(239,68,68,0.2)', borderColor:'rgba(239,68,68,0.3)' }}>Clear Team</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="poke-team-header">
                <p className="poke-team-count">
                    {team.length}/6 Pokémon — {team.length < 6 ? 'Search the Pokédex to add more!' : 'Team full!'}
                </p>
                <div className="poke-team-actions">
                    <button className="glass-btn-secondary" onClick={refreshTeam}>🔄 Refresh</button>
                    {team.length > 0 && (
                        <button className="glass-btn-secondary" onClick={() => setConfirmClear(true)}>
                            🗑️ Clear Team
                        </button>
                    )}
                </div>
            </div>

            <div className="poke-team-grid">
                {team.map(p => (
                    <div key={p.id} className="glass-card poke-team-card">
                        <img src={p.sprite} alt={p.name} className="poke-team-sprite" />
                        <h3 className="poke-team-name">{p.name.charAt(0).toUpperCase() + p.name.slice(1)}</h3>
                        <div className="poke-types">
                            {(p.types || []).map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                        <p className="poke-team-level">Lv. {p.level || 5}</p>
                        <div className="poke-mini-hp">
                            <span className="poke-mini-hp-text">
                                HP {Math.floor(p.currentHP ?? p.stats?.hp ?? 50)}/{p.stats?.hp ?? 50}
                            </span>
                            <div className="poke-mini-hp-bar">
                                <div className="poke-mini-hp-fill"
                                    style={{ width: `${Math.round(((p.currentHP ?? p.stats?.hp ?? 50) / (p.stats?.hp ?? 50)) * 100)}%` }} />
                            </div>
                        </div>
                        <button className="glass-btn-secondary poke-remove-btn"
                            onClick={() => removePokemon(p.id)}>
                            Remove
                        </button>
                    </div>
                ))}
                {emptySlots.map((_, i) => (
                    <div key={`empty-${i}`} className="glass-card poke-empty-slot">
                        <span className="poke-empty-icon">⚪</span>
                        <p className="poke-empty-text">Empty Slot</p>
                    </div>
                ))}
            </div>

            {team.length === 0 && (
                <div className="glass-empty-state">
                    <span className="glass-empty-icon">🎒</span>
                    <h3>No Pokémon yet!</h3>
                    <p>Head to the Pokédex tab to search and add Pokémon to your team.</p>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TAB 3 — BATTLE
// ═══════════════════════════════════════════════════════════════

const BATTLE_OPPONENTS = [
    { id:6,   name:'charizard',  level:15, types:['fire','flying'] },
    { id:9,   name:'blastoise',  level:12, types:['water'] },
    { id:3,   name:'venusaur',   level:14, types:['grass','poison'] },
    { id:25,  name:'pikachu',    level:10, types:['electric'] },
    { id:149, name:'dragonite',  level:20, types:['dragon','flying'] },
    { id:94,  name:'gengar',     level:17, types:['ghost','poison'] },
    { id:130, name:'gyarados',   level:18, types:['water','flying'] },
    { id:143, name:'snorlax',    level:16, types:['normal'] },
];

function buildOpponent(opp) {
    const hp = 40 + opp.level * 3;
    return {
        id: opp.id,
        name: opp.name,
        level: opp.level,
        types: opp.types,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${opp.id}.png`,
        stats: { hp, attack: 30 + opp.level * 2, defense: 25 + opp.level, specialAttack: 28 + opp.level * 2, specialDefense: 22 + opp.level, speed: 20 + opp.level },
        currentHP: hp,
    };
}

function HPBar({ current, max }) {
    const pct = Math.max(0, Math.min(100, Math.round((current / max) * 100)));
    const color = pct > 50 ? '#4ade80' : pct > 25 ? '#facc15' : '#f87171';
    return (
        <div className="poke-battle-hp-bar">
            <div className="poke-battle-hp-fill" style={{ width:`${pct}%`, background:color }} />
        </div>
    );
}

function BattleTab({ toast }) {
    const [screen, setScreen] = useState('select');
    const [team, setTeam] = useState(getTeam);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [selectedOpp, setSelectedOpp] = useState(0);
    const [battle, setBattle] = useState(null);
    const [log, setLog] = useState([]);
    const [resultMsg, setResultMsg] = useState('');
    const [waiting, setWaiting] = useState(false);
    const [showMoves, setShowMoves] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [showSwitch, setShowSwitch] = useState(false);
    const [confirmFlee, setConfirmFlee] = useState(false);
    const [items, setItems] = useState([
        { name:'Potion', heal:20, qty:3 },
        { name:'Super Potion', heal:50, qty:1 },
        { name:'Max Potion', heal:999, qty:1 },
    ]);

    const addLog = (msg) => setLog(prev => [...prev.slice(-19), msg]);

    const startBattle = () => {
        const refreshedTeam = getTeam();
        setTeam(refreshedTeam);
        if (!refreshedTeam.length) { toast.warning('Add Pokémon to your team first!'); return; }
        const idx = Math.min(selectedIdx, refreshedTeam.length - 1);
        const player = normalizePokemon(refreshedTeam[idx]);
        const oppDef  = BATTLE_OPPONENTS[selectedOpp];
        const opp     = normalizePokemon(buildOpponent(oppDef));
        const playerMoves = getMovesForPokemon(player.name).map(m => ({ ...m }));
        const oppMoves    = getMovesForPokemon(opp.name).map(m => ({ ...m }));
        setBattle({ player, opp, playerMoves, oppMoves });
        setLog([`⚔️ Battle started! Go, ${player.name.charAt(0).toUpperCase()+player.name.slice(1)}!`]);
        setScreen('battle');
        setWaiting(false);
        setShowMoves(false);
        setShowItems(false);
        setShowSwitch(false);
    };

    const executeAttack = useCallback((moveName) => {
        if (!battle || waiting) return;
        setShowMoves(false);

        setBattle(prev => {
            const b = JSON.parse(JSON.stringify(prev));
            const move = b.playerMoves.find(m => m.name === moveName);
            if (!move || move.pp <= 0) return prev;
            move.pp--;

            const logs = [];
            if (Math.random() * 100 <= move.accuracy) {
                if (move.category === 'status') {
                    logs.push(`${b.player.name} used ${move.displayName}!`);
                } else {
                    const atkStat = move.category === 'special' ? b.player.stats.specialAttack : b.player.stats.attack;
                    const defStat = move.category === 'special' ? b.opp.stats.specialDefense : b.opp.stats.defense;
                    const { dmg, crit, eff } = calcDamage(b.player.level, atkStat, defStat, move.power, move.type, b.opp.types);
                    b.opp.currentHP = Math.max(0, b.opp.currentHP - dmg);
                    logs.push(`${b.player.name} used ${move.displayName}! (${dmg} dmg)`);
                    if (crit) logs.push('⭐ Critical hit!');
                    if (eff > 1) logs.push("It's super effective!");
                    else if (eff < 1 && eff > 0) logs.push("It's not very effective…");
                    else if (eff === 0) logs.push("It has no effect!");
                }
            } else {
                logs.push(`${b.player.name}'s ${move.displayName} missed!`);
            }

            logs.forEach(l => addLog(l));
            return b;
        });

        setWaiting(true);
        setTimeout(() => {
            setBattle(prev => {
                if (!prev) return prev;
                if (prev.opp.currentHP <= 0) {
                    setResultMsg(`🏆 You won! ${prev.opp.name} fainted!`);
                    setScreen('result');
                    return prev;
                }
                const b = JSON.parse(JSON.stringify(prev));
                const availMoves = b.oppMoves.filter(m => m.pp > 0 && m.category !== 'status');
                const aiMove = availMoves.length ? availMoves[Math.floor(Math.random() * availMoves.length)] : b.oppMoves[0];
                if (aiMove) {
                    aiMove.pp = Math.max(0, aiMove.pp - 1);
                    if (Math.random() * 100 <= aiMove.accuracy) {
                        const atkStat = aiMove.category === 'special' ? b.opp.stats.specialAttack : b.opp.stats.attack;
                        const defStat = aiMove.category === 'special' ? b.player.stats.specialDefense : b.player.stats.defense;
                        if (aiMove.power > 0) {
                            const { dmg } = calcDamage(b.opp.level, atkStat, defStat, aiMove.power, aiMove.type, b.player.types);
                            b.player.currentHP = Math.max(0, b.player.currentHP - dmg);
                            addLog(`${b.opp.name} used ${aiMove.displayName}! (${dmg} dmg)`);
                        } else {
                            addLog(`${b.opp.name} used ${aiMove.displayName}!`);
                        }
                    } else {
                        addLog(`${b.opp.name}'s ${aiMove.displayName} missed!`);
                    }
                }
                if (b.player.currentHP <= 0) {
                    setResultMsg(`💀 ${b.player.name} fainted! You lost…`);
                    setScreen('result');
                }
                setWaiting(false);
                return b;
            });
        }, 1200);
    }, [battle, waiting]);

    const useItem = (item) => {
        if (!battle || item.qty <= 0) return;
        setShowItems(false);
        const heal = Math.min(item.heal, battle.player.stats.hp - battle.player.currentHP);
        if (heal <= 0) { addLog(`${item.name} had no effect!`); return; }
        setBattle(prev => {
            const b = JSON.parse(JSON.stringify(prev));
            b.player.currentHP = Math.min(b.player.stats.hp, b.player.currentHP + item.heal);
            return b;
        });
        setItems(prev => prev.map(i => i.name === item.name ? { ...i, qty: i.qty - 1 } : i));
        addLog(`Used ${item.name}! Restored ${heal} HP!`);
        setWaiting(true);
        setTimeout(() => {
            setBattle(prev => {
                if (!prev) return prev;
                const b = JSON.parse(JSON.stringify(prev));
                const availMoves = b.oppMoves.filter(m => m.pp > 0 && m.power > 0);
                const aiMove = availMoves.length ? availMoves[Math.floor(Math.random() * availMoves.length)] : null;
                if (aiMove) {
                    aiMove.pp = Math.max(0, aiMove.pp - 1);
                    const { dmg } = calcDamage(b.opp.level, b.opp.stats.attack, b.player.stats.defense, aiMove.power, aiMove.type, b.player.types);
                    b.player.currentHP = Math.max(0, b.player.currentHP - dmg);
                    addLog(`${b.opp.name} used ${aiMove.displayName}! (${dmg} dmg)`);
                    if (b.player.currentHP <= 0) { setResultMsg(`💀 ${b.player.name} fainted! You lost…`); setScreen('result'); }
                }
                setWaiting(false);
                return b;
            });
        }, 1200);
    };

    const switchPokemon = (idx) => {
        const newTeam = getTeam();
        const newMember = normalizePokemon(newTeam[idx]);
        if (!newMember || newMember.currentHP <= 0) return;
        if (newMember.id === battle?.player?.id) return;
        setShowSwitch(false);
        setBattle(prev => {
            const b = JSON.parse(JSON.stringify(prev));
            b.player = newMember;
            b.playerMoves = getMovesForPokemon(newMember.name).map(m => ({ ...m }));
            return b;
        });
        addLog(`Go, ${newMember.name.charAt(0).toUpperCase()+newMember.name.slice(1)}!`);
    };

    const flee = () => { setConfirmFlee(true); };

    if (screen === 'select') {
        const freshTeam = getTeam();
        return (
            <div>
                {confirmFlee && (
                    <div className="confirm-dialog-overlay" onClick={() => setConfirmFlee(false)}>
                        <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                            <h3>Flee from Battle?</h3>
                            <p>Are you sure you want to run away? This will end the battle.</p>
                            <div className="confirm-dialog-actions">
                                <button className="glass-btn-secondary" onClick={() => setConfirmFlee(false)}>Cancel</button>
                                <button className="glass-btn" onClick={() => { setScreen('select'); setConfirmFlee(false); toast.info('You fled from battle!'); }}>Flee</button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="poke-battle-setup">
                    <div className="glass-card poke-setup-card">
                        <h3>🎒 Your Pokémon</h3>
                        {freshTeam.length === 0 ? (
                            <p className="poke-setup-empty">Add Pokémon to your team in the Team tab first!</p>
                        ) : (
                            <div className="poke-select-grid">
                                {freshTeam.map((p, i) => (
                                    <div key={p.id}
                                        className={`poke-select-card ${selectedIdx === i ? 'selected' : ''}`}
                                        onClick={() => setSelectedIdx(i)}>
                                        <img src={p.sprite} alt={p.name} />
                                        <p>{p.name.charAt(0).toUpperCase()+p.name.slice(1)}</p>
                                        <span>Lv.{p.level}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-card poke-setup-card">
                        <h3>⚔️ Choose Opponent</h3>
                        <div className="poke-select-grid">
                            {BATTLE_OPPONENTS.map((opp, i) => (
                                <div key={opp.id}
                                    className={`poke-select-card ${selectedOpp === i ? 'selected' : ''}`}
                                    onClick={() => setSelectedOpp(i)}>
                                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${opp.id}.png`} alt={opp.name} />
                                    <p>{opp.name.charAt(0).toUpperCase()+opp.name.slice(1)}</p>
                                    <span>Lv.{opp.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="poke-start-btn-container">
                    <button className="glass-btn poke-start-btn" onClick={startBattle} disabled={!freshTeam.length}>
                        ⚔️ Start Battle!
                    </button>
                </div>
            </div>
        );
    }

    if (screen === 'result') {
        return (
            <div className="poke-result-screen">
                <div className="glass-card poke-result-card">
                    <div className="poke-result-icon">{resultMsg.startsWith('🏆') ? '🏆' : '💀'}</div>
                    <h2 className="poke-result-message">{resultMsg}</h2>
                    <div className="poke-result-actions">
                        <button className="glass-btn" onClick={() => { setBattle(null); setScreen('select'); setItems([{ name:'Potion', heal:20, qty:3 },{ name:'Super Potion', heal:50, qty:1 },{ name:'Max Potion', heal:999, qty:1 }]); }}>
                            🔄 Battle Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (screen === 'battle' && battle) {
        const { player, opp, playerMoves } = battle;

        return (
            <div className="poke-battle-arena">
                {confirmFlee && (
                    <div className="confirm-dialog-overlay" onClick={() => setConfirmFlee(false)}>
                        <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                            <h3>Flee from Battle?</h3>
                            <p>Are you sure you want to run away? This will end the battle.</p>
                            <div className="confirm-dialog-actions">
                                <button className="glass-btn-secondary" onClick={() => setConfirmFlee(false)}>Cancel</button>
                                <button className="glass-btn" onClick={() => { setScreen('select'); setConfirmFlee(false); toast.info('You fled from battle!'); }}>Flee</button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="poke-battle-field glass-card">
                    <div className="poke-fighter opp-fighter">
                        <div className="poke-fighter-info">
                            <div className="poke-fighter-name">{opp.name.charAt(0).toUpperCase()+opp.name.slice(1)}</div>
                            <div className="poke-fighter-level">Lv. {opp.level}</div>
                            <div className="poke-fighter-hp-text">{Math.ceil(opp.currentHP)}/{opp.stats.hp} HP</div>
                            <HPBar current={opp.currentHP} max={opp.stats.hp} />
                        </div>
                        <img src={opp.sprite} alt={opp.name} className="poke-fighter-sprite opp-sprite" />
                    </div>

                    <div className="poke-fighter player-fighter">
                        <img src={player.sprite} alt={player.name} className="poke-fighter-sprite player-sprite" />
                        <div className="poke-fighter-info">
                            <div className="poke-fighter-name">{player.name.charAt(0).toUpperCase()+player.name.slice(1)}</div>
                            <div className="poke-fighter-level">Lv. {player.level}</div>
                            <div className="poke-fighter-hp-text">{Math.ceil(player.currentHP)}/{player.stats.hp} HP</div>
                            <HPBar current={player.currentHP} max={player.stats.hp} />
                        </div>
                    </div>
                </div>

                <div className="poke-battle-lower">
                    <div className="glass-card poke-battle-log">
                        <h4>BATTLE LOG</h4>
                        <div className="poke-log-entries">
                            {log.map((l, i) => <div key={i} className="poke-log-entry">{l}</div>)}
                        </div>
                    </div>

                    <div className="glass-card poke-battle-commands">
                        <p className="poke-command-title">
                            {waiting ? '⏳ Opponent is thinking…' : `What will ${player.name} do?`}
                        </p>

                        {!showMoves && !showItems && !showSwitch && (
                            <div className="poke-action-btns">
                                <button className="poke-action-btn fight" onClick={() => setShowMoves(true)} disabled={waiting}>⚔️ ATTACK</button>
                                <button className="poke-action-btn bag"   onClick={() => setShowItems(true)}  disabled={waiting}>🎒 BAG</button>
                                <button className="poke-action-btn poke"  onClick={() => setShowSwitch(true)} disabled={waiting}>🔄 SWITCH</button>
                                <button className="poke-action-btn run"   onClick={flee}                      disabled={waiting}>🏃 RUN</button>
                            </div>
                        )}

                        {showMoves && (
                            <div>
                                <div className="poke-move-grid">
                                    {playerMoves.map(m => (
                                        <button key={m.name} className="poke-move-btn"
                                            style={{ borderColor: TYPE_COLORS[m.type] || '#888' }}
                                            onClick={() => executeAttack(m.name)}
                                            disabled={m.pp <= 0 || waiting}>
                                            <span className="poke-move-name">{m.displayName}</span>
                                            <span className="poke-type-badge">{m.type}</span>
                                            <span className="poke-move-pp">PP {m.pp}/{m.maxPP}</span>
                                            {m.power > 0 && <span className="poke-move-pwr">PWR {m.power}</span>}
                                        </button>
                                    ))}
                                </div>
                                <button className="glass-btn-secondary poke-back-btn" onClick={() => setShowMoves(false)}>← Back</button>
                            </div>
                        )}

                        {showItems && (
                            <div>
                                <div className="poke-item-grid">
                                    {items.map(item => (
                                        <button key={item.name} className="poke-item-btn"
                                            onClick={() => useItem(item)}
                                            disabled={item.qty <= 0 || waiting}>
                                            🧪 {item.name} x{item.qty}
                                        </button>
                                    ))}
                                </div>
                                <button className="glass-btn-secondary poke-back-btn" onClick={() => setShowItems(false)}>← Back</button>
                            </div>
                        )}

                        {showSwitch && (
                            <div>
                                <div className="poke-switch-grid">
                                    {getTeam().map((p, i) => {
                                        const norm = normalizePokemon(p);
                                        const isCurrent = norm.id === player.id;
                                        const fainted = norm.currentHP <= 0;
                                        return (
                                            <button key={p.id} className="poke-switch-btn"
                                                onClick={() => switchPokemon(i)}
                                                disabled={isCurrent || fainted || waiting}>
                                                <img src={p.sprite} alt={p.name} />
                                                <span>{p.name.charAt(0).toUpperCase()+p.name.slice(1)}</span>
                                                <span className="poke-switch-status">
                                                    {isCurrent ? '(Active)' : fainted ? 'Fainted' : `HP ${Math.ceil(norm.currentHP)}`}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <button className="glass-btn-secondary poke-back-btn" onClick={() => setShowSwitch(false)}>← Back</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

const TABS = [
    { key:'pokedex', label:'📖 Pokédex' },
    { key:'team',    label:'🎒 My Team' },
    { key:'battle',  label:'⚔️ Battle'  },
];

export default function PokemonPage() {
    const { toasts, toast, removeToast } = useToast();
    const [activeTab, setActiveTab] = useState('pokedex');

    return (
        <div className="pokemon-page glass-page">
            <div className="poke-bg-orb poke-orb-1" />
            <div className="poke-bg-orb poke-orb-2" />
            <div className="poke-bg-orb poke-orb-3" />

            <div className="glass-container">
                <div className="glass-page-header">
                    <h1>⚡ Pokémon Hub</h1>
                    <p className="subtitle">Browse the Pokédex, build your dream team, and battle!</p>
                </div>

                <div className="glass-tabs">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            className={`glass-tab ${activeTab === t.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'pokedex' && <PokedexTab toast={toast} />}
                {activeTab === 'team'    && <TeamTab toast={toast} />}
                {activeTab === 'battle'  && <BattleTab toast={toast} />}
            </div>
            
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}