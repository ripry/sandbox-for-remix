import { defer } from "@remix-run/node"
import { Await, useLoaderData } from "@remix-run/react"
import { Suspense } from "react"

const sleep = (millis: number) =>  new Promise((resolve) => setTimeout(resolve, millis))

export async function loader() {
  const shortTask = async () => {
    await sleep(100)
    return { ok: true, message: "short task completed!"}
  }

  const longTask = async () => {
    await sleep(3000)
    return  {ok: true, message: "long task completed!"}
  }

  return defer({
    shortTask: shortTask(),
    longTask: longTask(),
  })
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <Suspense fallback={<div>Running short task...</div>}>
        <Await resolve={data.shortTask} errorElement={"short task error"}>
          {(shortTask) => 
            <div>short task result: {JSON.stringify(shortTask)}</div>
          }
        </Await>
      </Suspense>
      <Suspense fallback={<div>Running long task...</div>}>
        <Await resolve={data.longTask} errorElement={"long task error"}>
          {(longTask) => 
            <div>long task result: {JSON.stringify(longTask)}</div>
          }
        </Await>
      </Suspense>
    </>
  );
}
