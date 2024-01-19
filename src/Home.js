import React, { useEffect, useState } from 'react';
import { ArrowCircleUpIcon, PlusCircleIcon } from "@heroicons/react/solid";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';


const Home = () => {

    const [files, setFiles] = useState([""])
    const handleFiles = () => {
        setFiles([...files, ""]);
    }

    const handleFileChange = (index, file) => {
        const updatedFiles = [...files];
        updatedFiles[index] = file;
        setFiles(updatedFiles);
    }

    const [urls, setUrls] = useState(['']);
    const handleAddInputField = () => {
        setUrls([...urls, '']);
    };
    const handleUrlChange = (index, value) => {
        const updatedUrls = [...urls];
        updatedUrls[index] = value;
        setUrls(updatedUrls);
    };
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newTasks, setNewTasks] = useState([]);
    const [conversationHistory, setConversationHistory] = useState([]);

    const [title, setTitle] = useState("")

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        const formData = new FormData();

        formData.append('urls', JSON.stringify(urls));
        files.forEach((file) => {
            if (file) {
                formData.append('files', file);
            }
        });

        try {
            const response = await fetch('http://localhost:5000/scrape', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data.message);
            setResponse(data.message);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };



    const [config, setConfig] = useState(false);

    const showConfig = () => {
        setConfig(!config);
    }

    const [taskTemplate, setTaskTemplate] = useState(true)

    const [answer, setAnswer] = useState("")
    const [load, setLoad] = useState(false)


    const handleSubmission = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;


        const newMessage = { text: query, sender: 'user' };
        setConversationHistory([...conversationHistory, newMessage]);

        setQuery('');
        setLoad(true);
        try {
            const response = await fetch('http://localhost:5000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: newMessage.text })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const reply = { text: data.answer, sender: 'server' };
            setConversationHistory(history => [...history, reply]);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoad(false);
        }
    };

    const handleAddTask = () => {
        const newTask = {
            title: title || "New Task",
            query: "",
            urls: [""],
            files: [""]
        };
        setNewTasks([...newTasks, newTask]);
    };


    const [publications, setPublications] = useState([]);

    const [loadtitles, setLoadTitles] = useState(false)


    return (
        <div className=" pb-40">
            <div className='grid grid-cols-1 sm:grid-cols-2 rounded-3xl border-b border-blue-400'>
                <div className='flex items-center justify-center'>
                    <p className='py-12 text-lg font-semibold text-blue-500'>AbogaIA</p>
                </div>
                <div className='flex justify-end'>
                    <div className='flex w-full sm:w-2/3 py-12 justify-evenly'>
                        <button className='px-5 py-2 rounded border-2 border-blue-600 text-blue-500 font-semibold bg-white'>Ingresar</button>
                        <button className='px-5 py-2 rounded border-2 border-blue-600 text-blue-500 font-semibold bg-white'>Salir</button>
                    </div>
                </div>
            </div>
            <div className='sm:flex'>
                <div className='w-full hidden sm:w-1/6'>
                    <ol>
                        <li onClick={handleAddTask} className='py-6 border-gray-200 flex justify-center hover:text-gray-900 cursor-pointer text-gray-500 font-semibold '>Tus casos</li>
                        {(publications ?? []).map((publication, index) => {
                            return (
                                <li className='py-4 border-y border-gray-200 text-gray-700 flex justify-center hover:text-gray-900 cursor-pointer' key={index}>{publication.title}</li>
                            );
                        })}
                    </ol>
                </div>
                <div className='w-full sm:w-4/5'>
                    {taskTemplate &&
                        <div className='flex justify-center'>
                            <div className=' w-5/6 sm:w-full h-screen border-r border-gray-300'>
                                <div className='flex justify-center'>
                                    <div className='w-full pt-20 px-2 sm:flex'>
                                        <div className='flex w-full justify-center'>
                                            <div className='w-5/6'>
                                                <div className='flex py-6 justify-start'>
                                                    <p className='text-gray-800 font-semibold'>Hello. I am here to help you</p>
                                                    <input placeholder='Título'
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        className='border-2 hidden border-gray-200 rounded p-2 outline-none w-full' />
                                                </div>
                                                <div className='flex justify-center'>
                                                    <div className='w-full'>
                                                        <div className='overflow-y-auto max-h-96'>
                                                            {conversationHistory.map((message, index) => (
                                                                <div key={index} className={`my-2 p-2 max-w-3/4 ${message.sender === 'user' ? 'rounded-tl-3xl pl-3 rounded-br-3xl ml-96 bg-blue-500' : 'mr-24'}`}>
                                                                    <p className={`${message.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>{message.text}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className='w-5/6 sm:w-1/2 absolute bottom-6'>
                                                            <form onSubmit={handleSubmission} className='rounded-3xl border-2 border-gray-400 flex items-center justify-evenly'>
                                                                <input
                                                                    value={query}
                                                                    onChange={(e) => setQuery(e.target.value)}
                                                                    placeholder='Escribe tu consulta acá...'
                                                                    className='px-2 py-3 w-5/6 outline-none border-none'
                                                                />
                                                                <button type="submit" className=''>
                                                                    <ArrowCircleUpIcon className='text-blue-600 w-8 h-8 hover:text-blue-800' />
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <div className='w-full sm:w-1/5'>
                    <div className='w-11/12 flex justify-center pt-20'>
                        <button onClick={showConfig} className='px-6 py-2 rounded border-2 border-gray-800 text-gray-800 font-semibold'>{config ? "Close" : "Add sources"}</button>
                    </div>
                    <div>
                        {config &&
                            <div className=''>
                                <div className='mb-6 ml-2 w-11/12'>
                                    {urls.map((url, index) => (
                                        <div key={index} className="flex items-center justify-start mb-6">
                                            <input
                                                type="text"
                                                value={url}
                                                onChange={(e) => handleUrlChange(index, e.target.value)}
                                                placeholder="Add a URL"
                                                className="border w-full border-2 mt-3 border-gray-500 rounded outline-none p-2"
                                            />
                                            {index === urls.length - 1 && (
                                                <PlusCircleIcon
                                                    className="ml-2 w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer"
                                                    onClick={handleAddInputField}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mb-6 ml-2 w-11/12">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-start mb-6">
                                            <input
                                                type='file'
                                                onChange={(e) => handleFileChange(index, e.target.files[0])}
                                                className="border w-full border border-gray-500 rounded outline-none p-2"
                                            />
                                            {index === files.length - 1 && (
                                                <PlusCircleIcon
                                                    className="ml-2 w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer"
                                                    onClick={handleFiles}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className='flex justify-center'>
                                    {loading && <p>Saving...</p>}
                                    {error && <p className="text-red-500">{error}</p>}
                                    {response && <p className='text-gray-600'>{response.text}</p>}
                                </div>
                                <div className='flex justify-center pt-4 pb-12'>
                                    <button onClick={handleSubmit} className="border-2 border-blue-500 rounded font-semibold text-blue-500 py-2 px-5">
                                        Save
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
