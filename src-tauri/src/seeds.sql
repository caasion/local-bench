-- ─── Coding ───────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'coding',
    'Write a TypeScript function that takes a binary tree and returns a flattened array of values in level-order (BFS) traversal. Define your own node type, include error handling for null/empty inputs, and add a short usage example.'
);

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'coding',
    'Implement a generic LRU cache in Rust with get and put operations in O(1) time. Use only the standard library. Include doc comments and a main() that demonstrates eviction behaviour.'
);

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'coding',
    'Given the following Python function that checks whether a string is a valid IPv4 address, identify any bugs, fix them, and add unit tests using pytest:

```python
def is_valid_ipv4(s):
    parts = s.split(".")
    if len(parts) != 4:
        return False
    for part in parts:
        if not part.isdigit():
            return False
        if int(part) > 255:
            return False
    return True
```'
);

-- ─── Reasoning ────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'reasoning',
    'A farmer has 3 fields. Field A produces twice what Field B produces. Field C produces 40% less than Field A. Together they produce 1,200 bushels. How much does each field produce? Show your reasoning step by step before giving the final answer.'
);

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'reasoning',
    'You have a 3-gallon jug and a 5-gallon jug with no measurement markings. How do you measure exactly 4 gallons of water? Explain each step and why it works.'
);

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'reasoning',
    'Alice, Bob, and Carol each tell exactly one lie and one truth in any conversation. Alice says: "Bob always lies." Bob says: "Carol sometimes tells the truth." Carol says: "Alice told the truth just now." Determine the consistency of each statement and whether the scenario is logically possible.'
);

-- ─── Chat ─────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'chat',
    'Explain the difference between supervised and unsupervised learning to someone who has never studied machine learning. Use a real-world analogy and avoid jargon.'
);

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'chat',
    'I keep hearing about "the observer effect" in physics and in software testing. Are they the same idea, related, or totally different? Give me an intuitive explanation for both.'
);

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'chat',
    'What are three common misconceptions people have about how HTTP cookies work, and what is the reality behind each one?'
);

-- ─── Research ─────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'research',
    'Summarize the key tradeoffs between transformer and state space model (SSM) architectures for long-context tasks, covering memory usage, compute scaling, and practical deployment considerations. Cite specific model families where relevant.'
);

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'research',
    'Compare the consistency models offered by DynamoDB, Cassandra, and CockroachDB. For each, explain what "eventual consistency" or "strong consistency" means in practice and which workloads each fits best.'
);

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'research',
    'What does the research say about the effectiveness of retrieval-augmented generation (RAG) versus fine-tuning for domain adaptation of large language models? Summarize the main findings and known limitations of each approach.'
);

-- ─── Context Degradation ──────────────────────────────────────────────────────
-- These prompts embed growing amounts of realistic code context followed by
-- a simple question. Token counts are approximate (GPT-2 tokeniser baseline).
-- The benchmark runner is expected to vary the filler length programmatically;
-- these seeds provide the question anchors at four canonical depths.

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'context_degradation',
    '<<CONTEXT_TOKENS:25000>>

[The benchmark harness will prepend ~25 000 tokens of source-code context here before delivery to the model.]

Question: Based on the code above, what is the name of the function responsible for initialising the database connection?'
);

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'context_degradation',
    '<<CONTEXT_TOKENS:50000>>

[The benchmark harness will prepend ~50 000 tokens of source-code context here before delivery to the model.]

Question: Based on the code above, what is the name of the function responsible for initialising the database connection?'
);

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'context_degradation',
    '<<CONTEXT_TOKENS:75000>>

[The benchmark harness will prepend ~75 000 tokens of source-code context here before delivery to the model.]

Question: Based on the code above, what is the name of the function responsible for initialising the database connection?'
);

INSERT OR IGNORE INTO prompts (use_case_tag, content) VALUES (
    'context_degradation',
    '<<CONTEXT_TOKENS:100000>>

[The benchmark harness will prepend ~100 000 tokens of source-code context here before delivery to the model.]

Question: Based on the code above, what is the name of the function responsible for initialising the database connection?'
);
