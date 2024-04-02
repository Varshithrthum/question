import React, { useState, useEffect } from 'react';
import { firestore } from "../firebase_config";
import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
import Modal from './modal'; // Assuming you have a Modal component
import "./index.css"; // Assuming you have CSS styles for Question component

const Question = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responses, setResponses] = useState({});
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState("");
    const [makeAnonymous, setMakeAnonymous] = useState(false);

    useEffect(() => {
        const fetchQuestionsData = async () => {
            try {
                const response = await fetchQuestions();
                setQuestions(response);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchQuestionsData();
    }, []);

    const fetchQuestions = async () => {
        const querySnapshot = await getDocs(collection(firestore, 'questions'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const handleChange = (questionId, value, questionText) => {
        setResponses(prevState => ({
            ...prevState,
            [questionText]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const responseRef = collection(firestore, 'Responses');
            const docId = makeAnonymous ? undefined : email.trim();
            const data = { ...responses, email }; // Include email in the responses data
            if (!makeAnonymous) {
                await setDoc(doc(responseRef, email.trim()), data);
            } else {
                await addDoc(responseRef, data);
            }
            setSubmissionSuccess(true);
            setShowModal(true);
        } catch (error) {
            console.error("Error uploading response:", error);
        }

        setResponses({});
    };

    const makeResponsesAnonymous = () => {
        setMakeAnonymous(true);
        setSubmissionSuccess(false);
        setShowModal(false);
        console.log("Responses will be anonymous.");
    };

    const closeModal = () => {
        setShowModal(false);
        setSubmissionSuccess(false);
    };

    return (
        <div className="question-container">
            <h1 className="question-heading">Feedback Form</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email ID:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={!makeAnonymous}
                    disabled={makeAnonymous}
                />
                {!submissionSuccess && (
                    <>
                        <button type="button" onClick={makeResponsesAnonymous}>Make my responses anonymous</button>
                    </>
                )}
                <ul className="question-list">
                    {questions.map(question => (
                        <li key={question.id} className="question-item">
                            <p className="question-text">{question.Questions}</p>
                            <div className="options">
                                <label className="option">
                                    <input
                                        type="radio"
                                        name={question.id}
                                        value="Agree"
                                        onChange={() => handleChange(question.id, "Agree", question.Questions)}
                                    />
                                    Agree
                                </label>
                                <label className="option">
                                    <input
                                        type="radio"
                                        name={question.id}
                                        value="Strongly Agree"
                                        onChange={() => handleChange(question.id, "Strongly Agree", question.Questions)}
                                    />
                                    Strongly Agree
                                </label>
                                <label className="option">
                                    <input
                                        type="radio"
                                        name={question.id}
                                        value="Neutral"
                                        onChange={() => handleChange(question.id, "Neutral", question.Questions)}
                                    />
                                    Neutral
                                </label>
                                <label className="option">
                                    <input
                                        type="radio"
                                        name={question.id}
                                        value="Disagree"
                                        onChange={() => handleChange(question.id, "Disagree", question.Questions)}
                                    />
                                    Disagree
                                </label>
                                <label className="option">
                                    <input
                                        type="radio"
                                        name={question.id}
                                        value="Strongly Disagree"
                                        onChange={() => handleChange(question.id, "Strongly Disagree", question.Questions)}
                                    />
                                    Strongly Disagree
                                </label>
                            </div>
                        </li>
                    ))}
                </ul>
                {!submissionSuccess && <button type="submit" className="submit-button">Submit</button>}
            </form>
            {showModal && (
                <Modal closeModal={closeModal}>
                    <p className="success-message">Responses saved successfully!</p>
                    <button onClick={closeModal}>Close</button>
                </Modal>
            )}
        </div>
    );
};

export default Question;
