#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { resolve } from 'node:dns'
import { rejects } from 'node:assert'

const projectName = process.argv[2]

if( !projectName ) {
  console.error('Usage: create-express-esm <project-name>')
  process.exit(1)
}

if(projectName === '--help' || projectName === 'h'){
  console.log(`
create-express-esm

Usage:
  create-express-esm <project-name>

Example:
  create-express-esm my-api
`)
  process.exit(0)
}

if(projectName === '--version' || projectName === '-v'){
  console.log('1.0.0')
  process.exit(0)
}

if(!projectName) {
  console.error('Error: project name is required.')
  console.log('Use --help for more information.')
  process.exit(1)
}

const targetDir = path.resolve(process.cwd(), projectName)

try {
  await fs.access(targetDir)

  console.error(`Directory "${projectName}" already exists.`)
  process.exit(1)
} catch { 

}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const templateDir = path.join(__dirname, '..', 'template')

await fs.mkdir(targetDir)

await fs.cp(templateDir, targetDir, {
  recursive: true
})

const packagePath = path.join(targetDir, 'package.json');

const packageJson = JSON.parse(
  await fs.readFile(packagePath, 'utf-8')
)

packageJson.name = projectName

await fs.writeFile(
  packagePath,
  JSON.stringify(packageJson, null, 2) + '\n'
)

console.log(`Created ${projectName}`)

function installDependencies(targetDir){
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['install'], {
      cwd: targetDir,
      stdio: 'inherit',
      shell: true
    })

    child.on('close', (code) => {
      if( code === 0 ){
        resolve()
      } else {
        reject(new Error(`npm install failed with code ${code}`))
      }
    })
  })
}

console.log('Installing dependencies...')

try {
  await installDependencies(targetDir)
  console.log('Done!')
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

