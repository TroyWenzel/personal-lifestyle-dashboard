// ─── Shopping List Service (localStorage) ────────────────────────────────────
const KEY = 'lifehub_shopping_list';

export const loadList = () => {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : { food: [], drinks: [] };
    } catch {
        return { food: [], drinks: [] };
    }
};

const persist = (list) => localStorage.setItem(KEY, JSON.stringify(list));

export const addItem = (section, name, measure = '') => {
    const list = loadList();
    const already = list[section].some(i => i.name.toLowerCase() === name.toLowerCase());
    if (already) return list;
    list[section].push({ id: Date.now() + Math.random(), name: name.trim(), measure: measure.trim(), checked: false });
    persist(list);
    return list;
};

export const removeItem = (section, id) => {
    const list = loadList();
    list[section] = list[section].filter(i => i.id !== id);
    persist(list);
    return list;
};

export const toggleItem = (section, id) => {
    const list = loadList();
    list[section] = list[section].map(i => i.id === id ? { ...i, checked: !i.checked } : i);
    persist(list);
    return list;
};

export const clearChecked = (section) => {
    const list = loadList();
    list[section] = list[section].filter(i => !i.checked);
    persist(list);
    return list;
};