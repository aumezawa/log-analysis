import * as React from "react"
import { useEffect, useRef, useCallback, useReducer } from "react"

import Axios from "axios"
import { AxiosResponse, AxiosError } from "axios"

import Cookies from "js-cookie"

import Environment from "../../lib/environment"
import ProjectPath from "../../lib/project-path-stats"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ResponsiveContainer } from "recharts"

type BrushStartEndIndex = {
  startIndex?   : number,
  endIndex?     : number
}

import Spinner from "../parts/spinner"
import CenterText from "../parts/center-text"

const colors = ["#82caca", "#ca8282", "#8282ca", "#caca82", "#ca82ca", "#82ca82"]

type StatsChartBoxProps = {
  domain        : string,
  project       : string,
  stats         : string,
  counter       : string,
  date_from?    : string,
  date_to?      : string,
  onChangeRange?: ((from: string, to: string) => void)
}

const StatsChartBox = React.memo<StatsChartBoxProps>(({
  domain        = null,
  project       = null,
  stats         = null,
  counter       = null,
  date_from     = null,
  date_to       = null,
  onChangeRange = undefined
}) => {
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  const data = useRef({
    start       : null,
    end         : null,
    data        : [] as Array<CounterData>
  })

  const status = useRef({
    processing  : false
  })

  useEffect(() => {
    if (domain && project && stats && counter) {
      const uri = `${ Environment.getBaseUrl() }/api/v1/${ ProjectPath.encode(domain, project, stats, counter) }`
      Axios.get(uri, {
        headers : { "X-Access-Token": Cookies.get("token") || "" },
        data    : {}
      })
      .then((res: AxiosResponse) => {
        data.current.data = res.data.data as Array<CounterData>
        data.current.start = data.current.data.map((data: CounterData) => (data.date)).indexOf(date_from)
        data.current.start = data.current.start === -1 ? 0 : data.current.start
        data.current.end = data.current.data.map((data: CounterData) => (data.date)).indexOf(date_to)
        data.current.end = data.current.end === -1 ? data.current.data.length - 1 : data.current.end
        forceUpdate()
        return
      })
      .catch((err: Error | AxiosError) => {
        data.current.data = []
        data.current.start = null
        data.current.end = null
        if (Axios.isAxiosError(err)) {
          // nop
        } else {
          console.log(err)
        }
        forceUpdate()
        return
      })
    } else {
      data.current.data = []
      data.current.start = null
      data.current.end = null
    forceUpdate()
    }
  }, [domain, project, stats, counter])

  const handleChangeBrush = useCallback((newIndex: any) => {
    const start = (newIndex as BrushStartEndIndex).startIndex
    const end = (newIndex as BrushStartEndIndex).endIndex
    if (onChangeRange) {
      onChangeRange(data.current.data[start].date as string, data.current.data[end].date as string)
    }
  }, [onChangeRange])

  const align = (input: number) => (
    (input <=    100) ?    100 :
    (input <=    500) ?    500 :
    (input <=   1000) ?   1000 :
    (input <=   5000) ?   5000 :
    (input <=  10000) ?  10000 :
    (input <=  50000) ?  50000 :
    (input <= 100000) ? 100000 : 1000000
  )

  return (
    <>
      {  status.current.processing && <Spinner /> }
      { !status.current.processing && (data.current.data.length === 0) && <CenterText text="No Data" /> }
      { !status.current.processing && (data.current.data.length !== 0) &&
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ data.current.data }>
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={ 30 } />
            <YAxis domain={ [0, (dataMax: number) => align(dataMax)] } />
            <Tooltip />
            <Legend verticalAlign="top" height={ 36 }/>
            {
              !!counter && counter.split(",").map((cnt: string, index: number) => {
                const x = cnt.split("->")
                const y = (x[1] === "default") ? `${ x[0] }_${ x[2] }` : `${ x[0] }(${ x[1] })_${ x[2] }`
                return (<Line key={ index } type="monotone" dataKey={ y } stroke={ colors[index] } fill={ colors[index] } />)
              })
            }
            <Brush dataKey="date" height={ 20 } startIndex={ data.current.start } endIndex={ data.current.end } onChange={ handleChangeBrush } />
          </LineChart>
        </ResponsiveContainer>
      }
    </>
  )
})

export default StatsChartBox

//BrushStartEndIndex