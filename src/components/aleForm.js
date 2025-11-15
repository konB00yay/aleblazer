"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CityCombobox } from "./combobox"
import { Button } from "./ui/button"
import { getBreweryCrawl } from "@/app/actions/brewery-actions"
import { usCities } from "@/data/us-cities"

const formSchema = z.object({
  breweries: z.coerce.number().min(1, "Must be at least 1").max(20, "Max 20 breweries"),
  distance: z.coerce.number().min(0.1, "Must be at least 0.1").max(50, "Max 50 miles"),
  city: z.string().min(1, "Please select a city"),
})

export function AleForm({ onCrawlGenerated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      breweries: "",
      distance: "",
      city: "",
    },
  })

  async function onSubmit(values) {
    setLoading(true)
    setError(null)
    
    try {
      // Get city details from the selected city
      const selectedCity = usCities.find(c => c.value === values.city)
      
      if (!selectedCity) {
        setError("Invalid city selected")
        return
      }
      
      // Call server action
      const result = await getBreweryCrawl(
        selectedCity.city,
        selectedCity.state,
        values.distance,
        values.breweries
      )
      
      if (result.error) {
        setError(result.error)
      } else {
        // Pass breweries to parent component
        onCrawlGenerated(result.breweries, result.warning, selectedCity)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField name="breweries" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Breweries</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="distance" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Max Distance Between Stops (miles)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="e.g., 2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <CityCombobox 
                    value={field.value} 
                    onChange={field.onChange} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Finding breweries..." : "Generate Crawl"}
          </Button>
        </form>
      </Form>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}
    </div>
  )
}