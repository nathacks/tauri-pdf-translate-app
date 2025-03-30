import { useEffect, useRef, useState } from 'react';
import { HeaderMain } from './HeaderMain.tsx';
import { DragDropEvent, getCurrentWebview } from '@tauri-apps/api/webview';
import { open } from '@tauri-apps/plugin-dialog';
import PdfSvg from '../assets/PDF_file_icon.svg';
import { Loader2, XCircle } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

export default function Main() {
    const [files, setFiles] = useState<{ path: string, fileName: string, isTranslating: boolean }[]>([]);
    const [loading, setLoading] = useState(false);
    const [translationSuccess, setTranslationSuccess] = useState(false)

    const sectionRef = useRef<HTMLElement>(null);

    const handleDrop = (pathFiles: string[]) => {
        setTranslationSuccess(false)
        setFiles(prevFiles => {
            const newFiles = pathFiles
                .filter(path => path.toLowerCase().endsWith('.pdf'))
                .filter(path => !prevFiles.some(file => file.path === path))
                .map(path => ({
                    path,
                    fileName: path.split('/').pop() || path,
                    isTranslating: false,
                }));

            return [...prevFiles, ...newFiles];
        });
    };

    const handleClick = async () => {
        const selectedFiles = await open({
            multiple: true,
            canCreateDirectories: false,
            filters: [{ extensions: ['pdf'], name: '*' }]
        });

        if (selectedFiles) {
            const paths = Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles];
            handleDrop(paths);
        }
    };

    const handleClickButton = async () => {
        setLoading(true);
        try {
            const pdfPaths = files.map(file => file.path);
            const outputPaths = files.map(file => file.path.replace('.pdf', '_translated.pdf'));

            setFiles(prevFiles =>
                prevFiles.map(file =>
                    file.isTranslating ? file : { ...file, isTranslating: true }
                )
            );

            await invoke<string[]>('translate_multiple_pdfs', { pdfPaths, outputPaths });

            setFiles(prevFiles =>
                prevFiles.filter(file => !file.isTranslating)
            );

            setTranslationSuccess(true)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let unlisten: (() => void) | null = null;

        const isInsideSection = (x: number, y: number): boolean => {
            if (!sectionRef.current) return false;
            const rect = sectionRef.current.getBoundingClientRect();
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        };

        const setupDragDrop = async () => {
            const webview = getCurrentWebview();
            if (!webview) return;

            unlisten = await webview.onDragDropEvent((event) => {
                const { type, position, paths } = event.payload as DragDropEvent & { position: any, paths: string[] };

                if (isInsideSection(position.x, position.y)) {
                    console.log(paths)
                    if (type === 'drop') handleDrop(paths);
                }
            });
        };

        setupDragDrop();

        return () => {
            if (unlisten) {
                unlisten();
            }
        };
    }, []);

    return (
        <main className={'flex flex-col flex-1 gap-5'}>
            <HeaderMain/>

            {translationSuccess && (
                <div className="text-green-9 text-center font-semibold">
                    PDF files have been successfully translated!
                </div>
            )}
            <section
                ref={sectionRef}
                className="flex flex-1 items-center cursor-pointer h-[270px] border-dashed border-2 rounded-2xl overflow-hidden border-red-500"
                onClick={handleClick}
            >
                {files.length ? (
                    <div className={'size-full flex flex-wrap gap-2 justify-center overflow-auto py-3'}>
                        {files.map((file, index) => (
                            <div key={index}
                                 className="flex flex-col relative justify-center gap-2 px-2 border size-24 border-red-8 rounded-lg">
                                <img className={'size-10 w-full'} src={PdfSvg} alt="PDF"/>
                                <span className={'text-xs truncate pt-1'}>{file.fileName}</span>

                                {file.isTranslating ? null : (
                                    <XCircle onClick={(event) => {
                                        event.stopPropagation();
                                        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
                                    }} className={'text-red-9 size-5 absolute right-0 top-0 m-1 cursor-pointer'}/>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={'text-center pb-3 px-5'}>Drag 'n' drop some pdf here, or click to select files</p>
                )}
            </section>
            <button disabled={!files.length || loading} onClick={handleClickButton}
                    className={'flex items-center justify-center gap-2 bg-red-10 disabled:bg-red-8 text-sand-1 py-2 rounded-lg cursor-pointer active:bg-red-9'}>
                Translate
                {loading ? <Loader2 className={'animate-spin'}/> : null}
            </button>
        </main>
    );
}
