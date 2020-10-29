// Firebase setup
const auth = firebase.auth()
const db = firebase.firestore()
const provider = new firebase.auth.GoogleAuthProvider()

// DOM sections
const mainSection = document.getElementById('main-section')

// Exercises blueprints
const workoutA = [
  {
    name: 'Pistol squats',
    sets: [0, 0, 0],
  },
  {
    name: 'Pull-ups',
    sets: [0, 0, 0],
  },
  {
    name: 'Chest dips',
    sets: [0, 0, 0]
  },
  {
    name: 'Leg raises',
    sets: [0, 0, 0]
  }
]

const workoutB = [
  {
    name: 'Schrimp squats',
    sets: [0, 0, 0],
  },
  {
    name: 'Front lever row',
    sets: [0, 0, 0],
  },
  {
    name: 'Handstand push-ups',
    sets: [0, 0, 0]
  },
  {
    name: 'Dragon flag',
    sets: [0, 0, 0]
  }
]

const generateForm = (exercises) => {
  return `
    <form id="form">
      <h3 id="set-1-header">Set 1</h3>
      <h3 id="set-2-header">Set 2</h3>
      <h3 id="set-3-header">Set 3</h3>
      <h3 id="exercise-1-name">${exercises[0].name}</h3>
      <input id="exercise-1-set-1-input" type="number" min="0" required placeholder=${exercises[0].sets[0]}>
      <input id="exercise-1-set-2-input" type="number" min="0" required placeholder=${exercises[0].sets[1]}>
      <input id="exercise-1-set-3-input" type="number" min="0" required placeholder=${exercises[0].sets[2]}>
      <h3 id="exercise-2-name">${exercises[1].name}</h3>
      <input id="exercise-2-set-1-input" type="number" min="0" required placeholder=${exercises[1].sets[0]}>
      <input id="exercise-2-set-2-input" type="number" min="0" required placeholder=${exercises[1].sets[1]}>
      <input id="exercise-2-set-3-input" type="number" min="0" required placeholder=${exercises[1].sets[2]}>
      <h3 id="exercise-3-name">${exercises[2].name}</h3>
      <input id="exercise-3-set-1-input" type="number" min="0" required placeholder=${exercises[2].sets[0]}>
      <input id="exercise-3-set-2-input" type="number" min="0" required placeholder=${exercises[2].sets[1]}>
      <input id="exercise-3-set-3-input" type="number" min="0" required placeholder=${exercises[2].sets[2]}>
      <h3 id="exercise-4-name">${exercises[3].name}</h3>
      <input id="exercise-4-set-1-input" type="number" min="0" required placeholder=${exercises[3].sets[0]}>
      <input id="exercise-4-set-2-input" type="number" min="0" required placeholder=${exercises[3].sets[1]}>
      <input id="exercise-4-set-3-input" type="number" min="0" required placeholder=${exercises[3].sets[2]}>
      <button type="submit" id="submit-button">Finished!</button>
    </form>
    <br>
    <button id="sign-out-btn">Sign out</button>
  `
}

const getLatestWorkout = async (user) => {
  
}

auth.onAuthStateChanged(async user => {
  if (user) {
    // Logged in

    const workoutsRef = db.collection('workouts')
    const snapshot = await workoutsRef
      .where('uid', '==', user.uid)
      .get()

    let workout

    if (snapshot.empty) {
      // No workouts so default to A with no reps
      workout = [ ...workoutA ]
    } else if (snapshot.size === 1) {
      // One workout so default to B with no reps
      workout = [ ...workoutB ]
    } else {
      // Two or more workouts so default to previous of same
      const workouts = snapshot.docs.map(doc => doc.data()).sort((a, b) => b.date - a.date)
      workout = workouts[1].exercises
    }

    mainSection.innerHTML = generateForm(workout)

    const signOutBtn = document.getElementById('sign-out-btn')
    const form = document.getElementById('form')

    signOutBtn.addEventListener('click', () => auth.signOut())
    form.addEventListener('submit', async e => {
      e.preventDefault()

      const exercises = [ ...workout ]
      const data = Array.from(e.target.elements).map(e => Number(e.value))
      exercises.forEach((exercise) => {
        exercise.sets = data.splice(0, 3)
      })

      workoutsRef.add({
        uid: user.uid,
        date: firebase.firestore.FieldValue.serverTimestamp(),
        exercises
      })
    })
  } else {
    // Logged out
    mainSection.innerHTML = `
      <button id="sign-in-btn">Sign in with Google</button>
    `
    const signInBtn = document.getElementById('sign-in-btn')
    signInBtn.addEventListener('click', () => auth.signInWithPopup(provider))
  }
})
