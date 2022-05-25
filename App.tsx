import * as React from 'react';
import './style.css';
import { useMachine, useInterpret } from '@xstate/react';

import { quizMachine } from './src/Machines/Quiz';

export default function App() {
  const [state, send] = useMachine(quizMachine);
  const quizService = useInterpret(quizMachine);

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

      {state.matches('Start') && (
        <div>
          <h4>Quiz Time</h4>
          <button onClick={() => send('Fetch')}>Fetch quiz</button>
        </div>
      )}
      {state.matches('Ready') && (
        <div>
          <h4>Nice! Found a quiz. Ready to start?</h4>
          <button onClick={() => send('Start')}>Start</button>
        </div>
      )}

      {state.matches('Ready.Question') && (
        <div>
          <h4>Preamble</h4>
          <p>{questions[currentQuestion].question}</p>
          <button onClick={() => send('Next')}>Next</button>
        </div>
      )}

      <div>
        {/** You can send events to the running service */}

        {/* <button onClick={() => send('REJECT')}>Reject</button> */}
      </div>
    </div>
  );
}
