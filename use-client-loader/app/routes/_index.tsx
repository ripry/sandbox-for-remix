import { defer } from "@remix-run/node"
import { Await, ClientLoaderFunctionArgs, useLoaderData } from "@remix-run/react"
import { Suspense } from "react"

const sleep = (millis: number) =>  new Promise((resolve) => setTimeout(resolve, millis))

type TaskResult = { ok: boolean, message: string}
type LoaderData = {
  shortTask: Promise<TaskResult>
  longTask: Promise<TaskResult>
  clientTask?: Promise<TaskResult>
}

export async function loader() {
  const shortTask = async (): Promise<TaskResult> => {
    await sleep(100)
    return { ok: true, message: "short task completed!" }
  }

  const longTask = async (): Promise<TaskResult> => {
    await sleep(3000)
    return  { ok: true, message: "long task completed!" }
  }

  return defer<LoaderData>({
    shortTask: shortTask(),
    longTask: longTask(),
  })
}

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const clientTask = async (): Promise<TaskResult> => {
    await sleep(5000)
    return { ok: true, message: "client task completed!" }
  }

  const serverData = await serverLoader<LoaderData>()

  return {
    ...serverData,
    clientTask: await clientTask(),
  }
}
clientLoader.hydrate = true

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
      {
        data.clientTask ? (
          <div>client task result: {JSON.stringify(data.clientTask)}</div>
        ) : (
          <div>Running client task...</div>
        )
      }
    </>
  );
}
