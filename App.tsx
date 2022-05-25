import * as React from 'react';
import './style.css';
import { useMachine } from '@xstate/react';

import { quizMachine } from './src/Machines/Quiz';

export default function App() {
  const [state, send] = useMachine(quizMachine);
  const { questions, currentQuestion } = state.context;
  return (
    <div>
      <div>Possible transitions: {state.nextEvents.map((p) => p)}</div>
      {/** You can listen to what state the service is in */}
      {state.matches('loading') && <p>Loading...</p>}
      {state.matches('success') && <p>Success</p>}
      {state.matches('resolved') && <p>Promise Resolved</p>}
      {/* {state.context.questions.map((question) => (
        <div>{question.question}</div>
      ))} */}

      {state.matches('Ready') && (
        <div>
          <h1>Quiz Time</h1>
          <button onClick={() => send('Start')}>Start</button>
        </div>
      )}

      {state.matches('Preamble') && (
        <div>
          <h1>Preamble</h1>
          <p>{questions[currentQuestion].question}</p>
          <button onClick={() => send('Next')}>Next</button>
        </div>
      )}

      <div>
        {/** You can send events to the running service */}
        <button onClick={() => send('Fetch')}>Start</button>
        {/* <button onClick={() => send('REJECT')}>Reject</button> */}
      </div>
    </div>
  );
}
