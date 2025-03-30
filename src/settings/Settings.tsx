import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { load } from '@tauri-apps/plugin-store';
import { HeaderSettings } from './HeaderSettings.tsx';
import { Check, Globe, X } from 'lucide-react';
import openaiIcon from '../assets/openai.svg';
import { LANGUAGES } from '../lib/languages.ts';


export function Settings() {
    const [apiKey, setApiKey] = useState('');
    const [store, setStore] = useState<any>(null);
    const [keyState, setKeyState] = useState<'view' | 'editing' | 'modified'>('view');
    const [translateTo, setTranslateTo] = useState<typeof LANGUAGES[number]>('English')

    useEffect(() => {
        async function initStore() {
            const loadedStore = await load('storeTradFile', { autoSave: true });
            setStore(loadedStore);

            const storedKey = await loadedStore.get<string>('OPENAI_API_KEY');
            if (storedKey) {
                setApiKey('***********');
            }

            const storedLanguage = await loadedStore.get<string>('TRANSLATE_TO');
            if (storedLanguage && LANGUAGES.includes(storedLanguage as typeof LANGUAGES[number])) {
                setTranslateTo(storedLanguage as typeof LANGUAGES[number]);
            }
        }

        initStore();
    }, []);

    const handleEdit = () => {
        if (keyState === 'editing') {
            setApiKey('***********');
            setKeyState('view');
        } else {
            setApiKey('');
            setKeyState('editing');
        }
    };

    const handleSaveApiKey = async () => {
        if (!store) return;

        try {
            await store.set('OPENAI_API_KEY', apiKey);
            await store.save();

            setApiKey('***********');
            setKeyState('view');
        } catch (error) {
            console.error('Error saving API key:', error);
        }
    };

    const handleLanguageChange = async (newLang: typeof LANGUAGES[number]) => {
        setTranslateTo(newLang);
        if (store) {
            await store.set('TRANSLATE_TO', newLang)
            await store.save();
        }
    };

    return (
        <main className="flex flex-col flex-1 gap-7">
            <HeaderSettings/>
            <div className="flex flex-1 flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-1 items-center">
                        <label className="font-semibold" htmlFor="apiKey">OpenAI API Key:</label>
                        <a target="_blank" className="text-blue-11 font-bold text-sm"
                           href="https://platform.openai.com/account/api-keys">
                            (Get API key here)
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <img className="size-6" src={openaiIcon} alt="Open AI Icon"/>
                        <input
                            id="apiKey"
                            type="text"
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                                setKeyState('modified');
                            }}
                            placeholder="sk-xxxxxxxxxxxxxxxxxxx"
                            className="border border-sand-8 flex-1 px-1 p-1 rounded-md focus:outline-2 focus:outline-offset-1 focus:red-8"
                        />
                        {keyState === 'modified' ? (
                            <button
                                onClick={handleSaveApiKey}
                                className="flex items-center gap-2 bg-blue-10 active:bg-blue-9 text-white h-full p-1 px-3 rounded-md cursor-pointer"
                            >
                                <Check size={16}/> Save
                            </button>
                        ) : (
                            <button
                                onClick={handleEdit}
                                className={`flex items-center gap-2 ${
                                    keyState === 'editing' ? 'bg-red-10 active:bg-red-9' : 'bg-blue-10 active:bg-blue-9'
                                } text-white h-full p-1 px-3 rounded-md cursor-pointer`}
                            >
                                {keyState === 'editing' ? <X size={16}/> : <Check size={16}/>}
                                {keyState === 'editing' ? 'Cancel' : 'Change'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Globe size={24}/>
                    <label className="font-semibold">Translate to :</label>
                    <select
                        value={translateTo}
                        onChange={(e) => handleLanguageChange(e.target.value as typeof LANGUAGES[number])}
                        className="border border-sand-8 px-2 py-1 rounded-md"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={() => invoke('exit_app')}
                className="self-end gap-2 bg-red-10 active:bg-red-9 text-white p-1 px-3 rounded-md cursor-pointer"
            >
                Quit
            </button>
        </main>
    );
}
