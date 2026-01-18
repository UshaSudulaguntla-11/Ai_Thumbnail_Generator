import React, { useState } from 'react';
import {
    Sparkles, Download, Loader2, Zap,
    Target, Palette, Maximize2,
    Grid, Box, SlidersHorizontal, Info, Globe,
    Check, Cpu, Video, Camera, Sun, Layout,
    Layers, Monitor, Smartphone, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const App = () => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Arts & Design',
        platform: ['YouTube'],
        aspect_ratio: ['16:9'],
        style: ['Professional'],
        lighting: ['Cinematic'],
        camera_angle: ['Eye Level'],
        instructions: '',
        enhancements: {
            '8K Resolution': true,
            'HDR Enhancement': true,
            'Deep Bokeh': false,
            'Film Grain': false,
            'Motion Blur': false,
            'Vibrant Grading': true,
            'Wide Angle': false,
            'Macro Focus': false
        }
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');

    const OPTIONS = {
        categories: ['Arts & Design', 'Education', 'Technology', 'Lifestyle', 'Gaming', 'Business', 'Health', 'Travel'],
        platforms: ['YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Twitter', 'Facebook', 'Twitch', 'Web'],
        ratios: ['16:9', '9:16', '1:1', '4:5', '21:9', '3:2'],
        styles: ['Professional', 'Cinematic', 'Hyper-Real', 'Minimalist', 'Editorial', 'Documentary', 'Vibrant', 'Dark/Moody'],
        lighting: ['Cinematic', 'Golden Hour', 'Neon/Night', 'Studio Soft', 'High Key', 'Low Key', 'Natural Light', 'Volumetric'],
        angles: ['Eye Level', 'High Angle', 'Low Angle', 'Macro Close-up', 'Birds Eye', 'Worms Eye', 'Wide Shot', 'POV']
    };

    const handleGenerate = async () => {
        if (!formData.title) return;
        setIsGenerating(true);
        setError('');
        setImage(null);

        try {
            const response = await axios.post('/api/generate', formData, {
                responseType: 'arraybuffer',
                timeout: 120000
            });

            const base64 = btoa(
                new Uint8Array(response.data).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    '',
                ),
            );
            setImage(`data:image/png;base64,${base64}`);
        } catch (err) {
            setError('Neural calibration failed. Our nodes are synchronizing, please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleMulti = (key, value) => {
        const current = [...formData[key]];
        const index = current.indexOf(value);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(value);
        }
        setFormData({ ...formData, [key]: current });
    };

    const toggleEnhancement = (key) => {
        setFormData({
            ...formData,
            enhancements: {
                ...formData.enhancements,
                [key]: !formData.enhancements[key]
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#050507]">
            <nav className="studio-nav">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="text-xl font-outfit font-black tracking-tighter uppercase italic text-white">Visionary Studio</span>
                    </div>
                    <div className="tag-badge">Total Multi-Select V3.5</div>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                    <span className="text-indigo-400">Node Cluster: Online</span>
                    <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                    <span>Unified Logic Active</span>
                </div>
            </nav>

            <div className="studio-container">
                <aside className="space-y-6">
                    {/* Main Blueprint Panel */}
                    <div className="panel">
                        <div className="panel-header">
                            <div className="title-group">
                                <Target className="icon w-4 h-4" />
                                <span>Project Title</span>
                            </div>
                        </div>
                        <div className="config-group">
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Python for Beginners"
                                className="studio-input !text-lg !font-bold"
                            />
                        </div>
                    </div>

                    {/* Category Select (NEW) */}
                    <SelectionPanel
                        title="Content Category"
                        icon={<Layers />}
                        options={OPTIONS.categories}
                        selected={[formData.category]}
                        onToggle={(val) => setFormData({ ...formData, category: val })}
                        multi={false}
                    />

                    {/* Platform Multi-Select (NEW) */}
                    <SelectionPanel
                        title="Target Platforms"
                        icon={<Share2 />}
                        options={OPTIONS.platforms}
                        selected={formData.platform}
                        onToggle={(val) => toggleMulti('platform', val)}
                    />

                    {/* Aspect Ratio Multi-Select (NEW) */}
                    <SelectionPanel
                        title="Active Aspect Ratios"
                        icon={<Maximize2 />}
                        options={OPTIONS.ratios}
                        selected={formData.aspect_ratio}
                        onToggle={(val) => toggleMulti('aspect_ratio', val)}
                        columns={3}
                    />

                    {/* Style Multi-Select */}
                    <SelectionPanel
                        title="Visual Style"
                        icon={<Palette />}
                        options={OPTIONS.styles}
                        selected={formData.style}
                        onToggle={(val) => toggleMulti('style', val)}
                    />

                    {/* Lighting Multi-Select */}
                    <SelectionPanel
                        title="Lighting Bias"
                        icon={<Sun />}
                        options={OPTIONS.lighting}
                        selected={formData.lighting}
                        onToggle={(val) => toggleMulti('lighting', val)}
                    />

                    {/* Camera Multi-Select */}
                    <SelectionPanel
                        title="Camera Perspective"
                        icon={<Camera />}
                        options={OPTIONS.angles}
                        selected={formData.camera_angle}
                        onToggle={(val) => toggleMulti('camera_angle', val)}
                    />

                    {/* Enhancements */}
                    <div className="panel">
                        <div className="panel-header">
                            <div className="title-group">
                                <Cpu className="icon w-4 h-4" />
                                <span>Neural Enhancements</span>
                            </div>
                        </div>
                        <div className="selection-grid">
                            {Object.keys(formData.enhancements).map((key) => (
                                <div
                                    key={key}
                                    className={`option-chip ${formData.enhancements[key] ? 'active' : ''}`}
                                    onClick={() => toggleEnhancement(key)}
                                >
                                    <div className="studio-checkbox"><Check className="check-icon" /></div>
                                    <span className="option-text">{key}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Directives */}
                    <div className="panel">
                        <div className="panel-header">
                            <div className="title-group">
                                <Info className="icon w-4 h-4" />
                                <span>Neural Directives</span>
                            </div>
                        </div>
                        <textarea
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            placeholder="Additional context or constraints..."
                            className="studio-textarea !h-24"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !formData.title}
                            className="generate-btn mt-6"
                        >
                            {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                            {isGenerating ? 'Synthesizing...' : 'Generate Studio Asset'}
                        </button>
                    </div>
                </aside>

                <main className="preview-bench">
                    <div className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-outfit font-black uppercase italic tracking-tighter text-white">Live Render Bench</h2>
                            <div className="h-4 w-px bg-white/10" />
                            <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Consensus Output Node</span>
                        </div>
                    </div>

                    <div
                        className={`result-card ${!image ? 'empty' : ''} min-h-[650px] flex items-center justify-center`}
                        style={{
                            aspectRatio: formData.aspect_ratio[0] ? formData.aspect_ratio[0].replace(':', ' / ') : '16 / 9'
                        }}
                    >
                        {image ? (
                            <div className="w-full h-full relative">
                                <img src={image} alt="Render" />
                                <div className="download-overlay">
                                    <div className="flex flex-col items-center gap-8">
                                        <div className="text-center px-10">
                                            <p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Master Render Authorized</p>
                                            <h3 className="text-4xl font-outfit font-black uppercase italic text-white tracking-widest leading-none mb-4">{formData.title}</h3>
                                            <div className="flex flex-wrap justify-center gap-2 mt-4 opacity-50">
                                                {formData.platform.map(p => <span key={p} className="text-[9px] font-bold uppercase border border-white/20 px-2 py-1 rounded">{p}</span>)}
                                            </div>
                                        </div>
                                        <a href={image} download="studio-asset.png" className="px-12 py-6 bg-white text-black rounded-full font-black text-sm uppercase tracking-tighter italic flex items-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all">
                                            <Download className="w-6 h-6" /> Export Master Resolution
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : isGenerating ? (
                            <div className="flex flex-col items-center gap-8">
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-indigo-500/10 rounded-full" />
                                    <div className="absolute inset-0 w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_40px_rgba(99,102,241,0.5)]" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="font-outfit font-black uppercase text-3xl italic tracking-tighter text-white animate-pulse">Synthesizing</p>
                                    <p className="text-[10px] uppercase tracking-[0.6em] text-indigo-500 font-black">Applying Consensus Logic</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-8 opacity-20">
                                <Layers className="w-40 h-40 text-white" strokeWidth={0.3} />
                                <div className="text-center space-y-2">
                                    <p className="text-xs uppercase tracking-[1em] font-black text-white">Workbench Idle</p>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em]">Configure studio parameters to begin</p>
                                </div>
                            </div>
                        )}
                        {isGenerating && <div className="studio-shimmer" />}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Metric icon={<Smartphone />} label="Platforms" value={formData.platform.length > 1 ? `${formData.platform.length} Selected` : formData.platform[0]} />
                        <Metric icon={<Maximize2 />} label="Ratios" value={formData.aspect_ratio.length > 1 ? `${formData.aspect_ratio.length} Selected` : formData.aspect_ratio[0]} />
                        <Metric icon={<Zap />} label="Logic" value="Multi-Task" />
                        <Metric icon={<Globe />} label="Node" value="Secure Cluster" />
                    </div>

                    {error && (
                        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-[0.4em] text-center">
                            {error}
                        </div>
                    )}
                </main>
            </div>
            <footer className="py-20 text-center opacity-30">
                <p className="text-[10px] font-black uppercase tracking-[1.5em] text-white">Visionary Universal Studio System v3.5</p>
            </footer>
        </div>
    );
};

const SelectionPanel = ({ title, icon, options, selected, onToggle, columns = 2, multi = true }) => (
    <div className="panel">
        <div className="panel-header">
            <div className="title-group">
                {React.cloneElement(icon, { size: 16, className: 'icon' })}
                <span>{title}</span>
            </div>
            <div className="multi-indicator">{multi ? `${selected.length} Active` : 'Single Select'}</div>
        </div>
        <div className={`selection-grid ${columns === 3 ? 'compact' : ''}`}>
            {options.map(opt => (
                <div
                    key={opt}
                    className={`option-chip ${selected.includes(opt) ? 'active' : ''}`}
                    onClick={() => onToggle(opt)}
                >
                    <div className="studio-checkbox"><Check className="check-icon" /></div>
                    <span className="option-text">{opt}</span>
                </div>
            ))}
        </div>
    </div>
);

const Metric = ({ icon, label, value }) => (
    <div className="panel flex items-center gap-6 py-6 group hover:translate-y-[-2px] transition-all">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors">
            {React.cloneElement(icon, { size: 22 })}
        </div>
        <div className="overflow-hidden">
            <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">{label}</p>
            <p className="text-sm font-black uppercase tracking-tighter italic text-zinc-300 truncate">{value}</p>
        </div>
    </div>
);

export default App;
