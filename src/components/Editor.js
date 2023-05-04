import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const [output, setOutput] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById('realtimeEditor'),
        {
          mode: 'javascript',
          theme: 'dracula',
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }
    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  const runCode = () => {
    const code = editorRef.current.getValue();
    try {
      const result = eval(code);
      setOutput(result);
    } catch (error) {
      setOutput(error.toString());
    }
  };

  return (
    <div>
      <textarea id="realtimeEditor"></textarea>
      <button
        style={{
          backgroundColor: 'blue',
          color:'yellow',
          border: '1px solid #ccc',
          padding: '8px',
          borderRadius: '4px',
          height:'80px',
          width:'80px',
          marginTop: '8px',
  
        }}
        onClick={runCode}
      >
        Run
      </button>
      {output && (
        <div
          style={{
            marginTop: '16px',
            border: '1px solid #ccc',
            padding: '8px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            color: output instanceof Error ? 'red' : 'inherit',
            fontWeight: output instanceof Error ? 'bold' : 'normal',
          }}
        >
          {output.toString()}
        </div>
      )}
    </div>
  );
};

export default Editor;
