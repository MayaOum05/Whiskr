import './index.css'
  import { useState, useEffect } from 'react'
  import { createClient } from '@supabase/supabase-js'
  import { Auth } from '@supabase/auth-ui-react'
  import { ThemeSupa } from '@supabase/auth-ui-shared'

  const supabase = createClient('https://<project>.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycHlkZ2p4aW93d3d1Z2VxbnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjU1ODAsImV4cCI6MjA3ODE0MTU4MH0.TR4jj2N-8H7uOT1D_UdXNLNmwAEL57Dg3d4bHLS24W4')

  export default function App() {
    const [session, setSession] = useState(null)

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })

      return () => subscription.unsubscribe()
    }, [])

    if (!session) {
      return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />)
    }
    else {
      return (<div>Logged in!</div>)
    }
  }