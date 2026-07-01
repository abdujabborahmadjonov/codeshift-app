export const MIGRATION_PATHS = [
  { id: "js-ts", from: "JavaScript", to: "TypeScript", icon: "TS", color: "#3178c6" },
  { id: "py2-py3", from: "Python 2", to: "Python 3", icon: "PY", color: "#3776ab" },
  { id: "react-class-hooks", from: "React Class", to: "React Hooks", icon: "⚛", color: "#61dafb" },
  { id: "cjs-esm", from: "CommonJS", to: "ES Modules", icon: "ES", color: "#f0db4f" },
  { id: "flask-fastapi", from: "Flask", to: "FastAPI", icon: "⚡", color: "#009688" },
  { id: "java8-java17", from: "Java 8", to: "Java 17", icon: "JV", color: "#e76f00" },
  { id: "xml-compose", from: "Android XML", to: "Jetpack Compose", icon: "CM", color: "#3ddc84" },
];

export const SAMPLES = {
  "js-ts": `const express = require('express');
const app = express();

function getUser(id) {
  return fetch(\`/api/users/\${id}\`)
    .then(res => res.json())
    .then(data => {
      return {
        name: data.name,
        email: data.email,
        age: data.age,
        isActive: data.status === 'active'
      };
    });
}

function calculateDiscount(price, discount, memberType) {
  let finalPrice = price;
  if (memberType === 'premium') {
    finalPrice = price * (1 - discount * 1.5);
  } else if (memberType === 'basic') {
    finalPrice = price * (1 - discount);
  }
  return Math.max(finalPrice, 0);
}

app.get('/users/:id', async (req, res) => {
  const user = await getUser(req.params.id);
  res.json(user);
});

module.exports = { getUser, calculateDiscount };`,
  "py2-py3": `#!/usr/bin/env python
import urllib2
import HTMLParser
from itertools import izip

class DataProcessor:
    def __init__(self, data):
        self.data = data

    def process(self):
        results = []
        for key, value in self.data.iteritems():
            if isinstance(value, basestring):
                results.append(unicode(value))
            elif isinstance(value, (int, long)):
                results.append(str(value))
        return results

    def fetch_url(self, url):
        response = urllib2.urlopen(url)
        return response.read()

def print_pairs(list_a, list_b):
    for a, b in izip(list_a, list_b):
        print a, b

if __name__ == '__main__':
    data = {u'name': u'Test', u'count': 42}
    processor = DataProcessor(data)
    print processor.process()`,
  "react-class-hooks": `import React, { Component } from 'react';

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      error: null,
      editMode: false
    };
    this.handleEdit = this.handleEdit.bind(this);
  }

  componentDidMount() {
    this.fetchUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser();
    }
  }

  componentWillUnmount() {
    this.controller?.abort();
  }

  async fetchUser() {
    this.controller = new AbortController();
    this.setState({ loading: true });
    try {
      const res = await fetch(\`/api/users/\${this.props.userId}\`, {
        signal: this.controller.signal
      });
      const user = await res.json();
      this.setState({ user, loading: false });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  }

  handleEdit() {
    this.setState({ editMode: !this.state.editMode });
  }

  render() {
    const { user, loading, error, editMode } = this.state;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return (
      <div>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <button onClick={this.handleEdit}>
          {editMode ? 'Cancel' : 'Edit'}
        </button>
      </div>
    );
  }
}

export default UserProfile;`,
  "cjs-esm": `const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const lodash = require('lodash');
const CONFIG = require('./config');

class FileWatcher extends EventEmitter {
  constructor(dir) {
    super();
    this.dir = dir;
    this.watchers = [];
  }

  start() {
    const files = fs.readdirSync(this.dir);
    files.forEach(file => {
      const fullPath = path.join(this.dir, file);
      const watcher = fs.watch(fullPath, (event) => {
        this.emit('change', { file, event });
      });
      this.watchers.push(watcher);
    });
  }

  stop() {
    this.watchers.forEach(w => w.close());
  }
}

module.exports = FileWatcher;
module.exports.CONFIG = CONFIG;`,
  "flask-fastapi": `from flask import Flask, request, jsonify
from functools import wraps

app = Flask(__name__)

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/users', methods=['GET'])
@require_auth
def get_users():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    users = [{'id': i, 'name': f'User {i}'} for i in range(limit)]
    return jsonify({'users': users, 'page': page})

@app.route('/users/<int:user_id>', methods=['GET'])
@require_auth
def get_user(user_id):
    return jsonify({'id': user_id, 'name': f'User {user_id}'})

@app.route('/users', methods=['POST'])
@require_auth
def create_user():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Name required'}), 400
    return jsonify({'id': 1, 'name': data['name']}), 201

if __name__ == '__main__':
    app.run(debug=True)`,
  "java8-java17": `import java.util.*;
import java.util.stream.*;

public class DataService {
    private List<Map<String, Object>> records;

    public DataService() {
        this.records = new ArrayList<>();
    }

    public List<String> getActiveUserNames() {
        List<String> names = new ArrayList<>();
        for (Map<String, Object> record : records) {
            if (record.get("active").equals(true)) {
                names.add((String) record.get("name"));
            }
        }
        return Collections.unmodifiableList(names);
    }

    public Optional<Map<String, Object>> findById(String id) {
        for (Map<String, Object> record : records) {
            if (record.get("id").equals(id)) {
                return Optional.of(record);
            }
        }
        return Optional.empty();
    }
}`,
  "xml-compose": `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="16dp">

    <ImageView
        android:id="@+id/avatarImage"
        android:layout_width="80dp"
        android:layout_height="80dp"
        android:contentDescription="@string/avatar_description"
        android:src="@drawable/ic_placeholder_avatar"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent" />

    <TextView
        android:id="@+id/nameText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginStart="16dp"
        android:textSize="20sp"
        android:textStyle="bold"
        android:text="@string/placeholder_name"
        app:layout_constraintTop_toTopOf="@id/avatarImage"
        app:layout_constraintStart_toEndOf="@id/avatarImage" />

    <TextView
        android:id="@+id/emailText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:textSize="14sp"
        android:textColor="#666666"
        android:text="@string/placeholder_email"
        app:layout_constraintTop_toBottomOf="@id/nameText"
        app:layout_constraintStart_toStartOf="@id/nameText" />

    <ProgressBar
        android:id="@+id/loadingSpinner"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:visibility="gone"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <Button
        android:id="@+id/editButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="24dp"
        android:text="@string/edit_profile"
        app:layout_constraintTop_toBottomOf="@id/avatarImage"
        app:layout_constraintStart_toStartOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>`,
};

export const PROMPTS = {
  "js-ts": `You are CodeShift, an expert code migration engine. Convert JavaScript to TypeScript.
Rules: Add proper type annotations. Convert require() to imports. Add interfaces for object shapes. No 'any' unless necessary. Preserve all logic. Convert module.exports to exports.
Output ONLY the migrated code. No explanations, no markdown fences, no backticks.`,
  "py2-py3": `You are CodeShift, an expert code migration engine. Convert Python 2 to Python 3.
Rules: print statements→print(). urllib2→urllib.request. iteritems()→items(). basestring→str. Remove unicode/long. izip→zip. Update deprecated imports. Preserve all logic.
Output ONLY the migrated code. No explanations, no markdown fences, no backticks.`,
  "react-class-hooks": `You are CodeShift, an expert code migration engine. Convert React class components to functional components with hooks.
Rules: state→useState. Lifecycle→useEffect. Methods→functions/useCallback. Remove constructor. Proper cleanup. Keep same props.
Output ONLY the migrated code. No explanations, no markdown fences, no backticks.`,
  "cjs-esm": `You are CodeShift, an expert code migration engine. Convert CommonJS to ES Modules.
Rules: require()→import. module.exports→export/export default. Handle named exports. Preserve all logic.
Output ONLY the migrated code. No explanations, no markdown fences, no backticks.`,
  "flask-fastapi": `You are CodeShift, an expert code migration engine. Convert Flask to FastAPI.
Rules: Flask routes→FastAPI routes. Pydantic models for request/response. Decorators→FastAPI dependencies. async/await. Type hints. HTTPException for errors. Preserve all logic.
Output ONLY the migrated code. No explanations, no markdown fences, no backticks.`,
  "java8-java17": `You are CodeShift, an expert code migration engine. Modernize Java 8 to Java 17+.
Rules: Use records, pattern matching, text blocks, var, Stream improvements, switch expressions where appropriate. Preserve all logic.
Output ONLY the migrated code. No explanations, no markdown fences, no backticks.`,
  "xml-compose": `You are CodeShift, an expert code migration engine. Convert Android XML layouts to Jetpack Compose (Kotlin).
Rules: Emit a single @Composable function named after the layout's purpose. Map views to Material3 composables: TextView→Text, ImageView→Image/Icon, Button→Button, EditText→OutlinedTextField, RecyclerView/ListView→LazyColumn or LazyRow, ProgressBar→CircularProgressIndicator, ConstraintLayout→ConstraintLayout (compose) or Column/Row when the structure is simple, ScrollView→Column with verticalScroll. Convert layout_width/height and margins/padding to Modifier chains (fillMaxWidth, fillMaxHeight, size, padding, wrapContentSize). Convert android:visibility="gone" to conditional composition (if/when) instead of a visibility modifier. Drop view IDs and findViewById/ViewBinding patterns; hoist state with remember/mutableStateOf and expose interaction via lambda parameters (onClick, onValueChange, etc.) instead of listeners. Convert drawables to painterResource(), strings/dimens to string/dimension resources via stringResource()/dimensionResource(). Preserve accessibility via contentDescription and Modifier.semantics. Preserve all structure and logic implied by the layout.
Output ONLY the migrated Kotlin code. No explanations, no markdown fences, no backticks.`,
};

export function getPath(id) {
  return MIGRATION_PATHS.find((p) => p.id === id);
}
