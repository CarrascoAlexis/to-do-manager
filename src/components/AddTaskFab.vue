<script setup lang="ts">
import { ref } from 'vue'
import { addTask, Tag, Status } from '@/resources/tasks'

const isOpen = ref(false)
const title = ref('')
const description = ref('')
const deadline = ref<string | null>(null)
const tags = ref<number[]>([])

function toggle() { isOpen.value = !isOpen.value }

function submit() {
  if (!title.value.trim()) return
  const newTask = {
    id: (crypto as any).randomUUID ? (crypto as any).randomUUID() : Date.now().toString(),
    title: title.value.trim(),
    description: description.value.trim() || undefined,
    status: Status.TODO,
    createdAt: new Date(),
    updatedAt: new Date(),
    deadline: deadline.value ? new Date(deadline.value) : undefined,
    tags: tags.value.length ? tags.value : undefined
  }

  addTask(newTask as any)
  // notify views to reload tasks
  window.dispatchEvent(new CustomEvent('tasks-updated'))
  // reset
  title.value = ''
  description.value = ''
  deadline.value = null
  tags.value = []
  isOpen.value = false
}

function toggleTag(t: number) {
  const i = tags.value.indexOf(t)
  if (i === -1) tags.value.push(t)
  else tags.value.splice(i, 1)
}
</script>

<template>
  <div>
    <button class="fab" @click="toggle" aria-label="Add task">＋</button>

    <transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="toggle">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Create task</h3>
            <button class="close-button" @click="toggle">✕</button>
          </div>

          <div class="modal-body">
            <label class="form-label">Title</label>
            <input v-model="title" class="input" placeholder="Task title" autofocus />

            <label class="form-label">Description</label>
            <textarea v-model="description" class="input" rows="3" placeholder="Optional description"></textarea>

            <label class="form-label">Deadline</label>
            <input v-model="deadline" type="date" class="input" />

            <label class="form-label">Tags</label>
            <div class="tags-row">
              <button type="button" class="tag-btn" :class="{active: tags.includes(0)}" @click="toggleTag(0)">Work</button>
              <button type="button" class="tag-btn" :class="{active: tags.includes(1)}" @click="toggleTag(1)">Personal</button>
              <button type="button" class="tag-btn" :class="{active: tags.includes(2)}" @click="toggleTag(2)">Urgent</button>
              <button type="button" class="tag-btn" :class="{active: tags.includes(3)}" @click="toggleTag(3)">Low</button>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="toggle">Cancel</button>
            <button class="btn btn-primary" @click="submit">Create</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style src="../styles/task-modal.css" scoped></style>

<style scoped>
/* Keep FAB styling local to this component */
.fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: var(--accent-color);
  color: var(--on-accent, #fff);
  border: none;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  font-size: 28px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* small helpers for form inputs to match modal look */
.input { padding:0.5rem; border-radius:8px; border:2px solid var(--sidebar-border); background:var(--card-bg); color:var(--text-color); width:100% }
.tags-row { display:flex; gap:0.5rem; margin-top:0.25rem }
.tag-btn { padding:0.35rem 0.6rem; border-radius:8px; border:2px solid var(--sidebar-border); background:var(--card-bg); color:var(--text-color); cursor:pointer }
.tag-btn.active { background:var(--accent-color); color:var(--on-accent,#fff); border-color:var(--accent-color) }

</style>
