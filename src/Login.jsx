
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {auth} from './firebase/firebase';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if(user){
                // redirect to / page
                navigate('/');
            }

        } catch (error) {
            setError(error.message);
            console.error('Error signing in:', error.code, error.message);
        }
    };

    return (
        <div className="min-h-full h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="mb-10">
                    <div className="flex justify-center">
                        <img
                            alt="logo"
                            className="h-14 w-14"
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3d8_VQ-P5mFtQ4bFx0Oq2lrPGKOX2YE2vZ_TBMtbP33jLJphsqf_OTp61ev0oVmVtKDI&usqp=CAU"
                        />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Are you Admin?
                    </h2>
                </div>
                <form className="border-2 p-4 rounded-lg shadow-lg " onSubmit={handleSubmit}>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="mb-6">
                        <label
                            className="block text-green-700 text-xl font-bold mb-2"
                            htmlFor="email"

                        >
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="email"
                            placeholder="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}

                        />
                    </div>
                    <div className="mb-6">
                        <label
                            className="block text-green-700 text-xl font-bold mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}

                        />
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            className="bg-green-700 hover:bg-green-600 text-white text-2xl font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
