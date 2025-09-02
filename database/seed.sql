-- Insert sample quizzes
INSERT INTO quizzes (title, description, category, difficulty_level, time_limit) VALUES
('JavaScript Fundamentals', 'Test your knowledge of basic JavaScript concepts', 'Programming', 'easy', 300),
('React Advanced Concepts', 'Advanced React patterns and hooks', 'Programming', 'hard', 600),
('General Knowledge', 'Mixed questions about various topics', 'General', 'medium', 240),
('Python Basics', 'Introduction to Python programming', 'Programming', 'easy', 420);

-- Insert questions for JavaScript Fundamentals quiz
INSERT INTO questions (quiz_id, question_text, question_type, points, explanation) VALUES
(1, 'What is the correct way to declare a variable in JavaScript?', 'multiple_choice', 1, 'let and const are preferred over var in modern JavaScript'),
(1, 'JavaScript is a compiled language.', 'true_false', 1, 'JavaScript is an interpreted language, not compiled'),
(1, 'What does "typeof null" return in JavaScript?', 'multiple_choice', 2, 'This is a known quirk in JavaScript where typeof null returns "object"');

-- Insert answer options for question 1
INSERT INTO answer_options (question_id, option_text, is_correct, option_order) VALUES
(1, 'var myVar;', false, 1),
(1, 'let myVar;', true, 2),
(1, 'variable myVar;', false, 3),
(1, 'declare myVar;', false, 4);

-- Insert answer options for question 2 (true/false)
INSERT INTO answer_options (question_id, option_text, is_correct, option_order) VALUES
(2, 'True', false, 1),
(2, 'False', true, 2);

-- Insert answer options for question 3
INSERT INTO answer_options (question_id, option_text, is_correct, option_order) VALUES
(3, '"null"', false, 1),
(3, '"undefined"', false, 2),
(3, '"object"', true, 3),
(3, '"boolean"', false, 4);

-- Insert questions for React Advanced Concepts quiz (id: 2)
INSERT INTO questions (quiz_id, question_text, question_type, points, explanation) VALUES
(2, 'Which hook is used for side effects in functional components?', 'multiple_choice', 1, 'useEffect is the hook for handling side effects'),
(2, 'React components must always return a single element.', 'true_false', 1, 'React components can return fragments or arrays since React 16'),
(2, 'What is the purpose of the dependency array in useEffect?', 'multiple_choice', 2, 'The dependency array controls when the effect runs');

-- Insert answer options for React questions
INSERT INTO answer_options (question_id, option_text, is_correct, option_order) VALUES
(4, 'useState', false, 1),
(4, 'useEffect', true, 2),
(4, 'useContext', false, 3),
(4, 'useReducer', false, 4);

INSERT INTO answer_options (question_id, option_text, is_correct, option_order) VALUES
(5, 'True', false, 1),
(5, 'False', true, 2);

INSERT INTO answer_options (question_id, option_text, is_correct, option_order) VALUES
(6, 'To style components', false, 1),
(6, 'To control when effects run', true, 2),
(6, 'To pass props', false, 3),
(6, 'To handle errors', false, 4);

-- Insert questions for General Knowledge quiz (id: 3)
INSERT INTO questions (quiz_id, question_text, question_type, points, explanation) VALUES
(3, 'What is the capital of Indonesia?', 'multiple_choice', 1, 'Jakarta is the capital and largest city of Indonesia'),
(3, 'The Great Wall of China is visible from space.', 'true_false', 1, 'This is a common myth. The Great Wall is not visible from space with the naked eye');

-- Insert answer options for General Knowledge questions
INSERT INTO answer_options (question_id, option_text, is_correct, option_order) VALUES
(7, 'Bandung', false, 1),
(7, 'Jakarta', true, 2),
(7, 'Surabaya', false, 3),
(7, 'Medan', false, 4);

INSERT INTO answer_options (question_id, option_text, is_correct, option_order) VALUES
(8, 'True', false, 1),
(8, 'False', true, 2);